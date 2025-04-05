from flask import Flask, render_template, request, jsonify
from langchain.chains import ConversationalRetrievalChain
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain_community.vectorstores import FAISS
from langchain.memory import ConversationBufferMemory
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate
import os
from flask_cors import CORS
from dotenv import load_dotenv
import pickle
from werkzeug.exceptions import HTTPException
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize Flask app with CORS
app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:3000",
            "https://talentforge-hr-bot.onrender.com",
            "https://talentforge-hr-frontend.onrender.com"
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Error handler
@app.errorhandler(Exception)
def handle_error(error):
    logger.error(f"Error occurred: {str(error)}", exc_info=True)
    code = 500
    if isinstance(error, HTTPException):
        code = error.code
    return jsonify({
        'status': 'error',
        'message': str(error)
    }), code

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        # Check if GROQ API key is set
        if not os.environ.get("GROQ_API_KEY"):
            return jsonify({
                'status': 'error',
                'message': 'GROQ API key is not set'
            }), 500

        # Check if embeddings directory exists
        embeddings_dir = Path("embeddings")
        if not embeddings_dir.exists():
            return jsonify({
                'status': 'error',
                'message': 'Embeddings directory not found'
            }), 500

        required_files = ['index.faiss', 'index.pkl', 'metadata.pkl']
        missing_files = [f for f in required_files if not (embeddings_dir / f).exists()]
        if missing_files:
            return jsonify({
                'status': 'error',
                'message': f'Missing required files: {", ".join(missing_files)}'
            }), 500

        return jsonify({
            'status': 'success',
            'message': 'API is running'
        })
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

# Initialize conversation chain
def initialize_chain():
    try:
        groq_api_key = os.environ.get("GROQ_API_KEY")
        if not groq_api_key:
            raise ValueError("GROQ API key not found in environment variables")

        logger.info("Initializing HuggingFace embeddings...")
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )

        logger.info("Loading FAISS vector store...")
        vector_store = FAISS.load_local(
            "embeddings",
            embeddings,
            allow_dangerous_deserialization=True
        )

        # Use Path for cross-platform compatibility
        metadata_path = Path("embeddings") / "metadata.pkl"
        with open(metadata_path, "rb") as f:
            metadata = pickle.load(f)

        logger.info(f"Loaded {metadata['num_documents']} documents with {metadata['num_chunks']} chunks")

        logger.info("Initializing ChatGroq...")
        llm = ChatGroq(
            api_key=groq_api_key,
            model_name="llama3-70b-8192",
            temperature=0.3,
            max_tokens=4000
        )

        # Use a smaller memory buffer
        memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True,
            max_token_limit=2000  # Limit memory size
        )

        system_prompt = SystemMessagePromptTemplate.from_template(
            "You are TalentForge AI, a placement and interview expert. First try to answer based on provided context chunks. If no direct context is available, then use your own knowledge to give the most relevant answer regarding placements, HR queries, and interview guidance."
        )
        human_prompt = HumanMessagePromptTemplate.from_template(
            "Use the following context to answer the question:\n\n{context}\n\nQuestion: {question}"
        )

        prompt = ChatPromptTemplate.from_messages([system_prompt, human_prompt])

        logger.info("Creating ConversationalRetrievalChain...")
        chain = ConversationalRetrievalChain.from_llm(
            llm=llm,
            chain_type='stuff',
            retriever=vector_store.as_retriever(search_kwargs={"k": 3}),  # Reduced from 5 to 3
            memory=memory,
            combine_docs_chain_kwargs={'prompt': prompt}
        )

        return chain
    except Exception as e:
        logger.error(f"Failed to initialize chain: {str(e)}", exc_info=True)
        raise

# Initialize the chain
try:
    conversation_chain = initialize_chain()
    conversation_history = []
    logger.info("Successfully initialized conversation chain")
except Exception as e:
    logger.error(f"Failed to initialize conversation chain: {str(e)}", exc_info=True)
    conversation_chain = None
    conversation_history = []

@app.route('/api/ask', methods=['POST'])
def ask():
    try:
        if conversation_chain is None:
            return jsonify({
                'status': 'error',
                'message': 'Conversation chain not initialized'
            }), 500

        user_message = request.json.get('message', '')
        if not user_message:
            return jsonify({
                'status': 'error',
                'message': 'Please provide a message'
            }), 400

        # Limit conversation history size
        if len(conversation_history) > 10:
            conversation_history.pop(0)

        result = conversation_chain({"question": user_message, "chat_history": conversation_history})
        answer = result["answer"]

        conversation_history.append((user_message, answer))

        return jsonify({
            'status': 'success',
            'data': {
                'answer': answer
            }
        })
    except Exception as e:
        logger.error(f"Error processing message: {str(e)}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/reset', methods=['POST'])
def reset():
    try:
        global conversation_history
        conversation_history = []
        return jsonify({
            'status': 'success',
            'message': 'Conversation reset successfully'
        })
    except Exception as e:
        logger.error(f"Error resetting conversation: {str(e)}", exc_info=True)
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True, use_reloader=False)  # Disabled reloader to prevent duplicate initialization