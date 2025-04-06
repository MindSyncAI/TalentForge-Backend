from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from langchain.chains import ConversationalRetrievalChain
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain_community.vectorstores import FAISS
from langchain.memory import ConversationBufferMemory
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate
import os
from dotenv import load_dotenv
import pickle

# Load environment variables
load_dotenv()

# Initialize Flask app with explicit template and static folders
app = Flask(__name__, template_folder='templates', static_folder='static')

# Configure CORS
CORS(app, origins=["https://talent-forge-hr-bot-px2r.vercel.app"], 
     methods=['GET', 'POST'],
     allow_headers=['Content-Type'])

def initialize_chain():
    try:
        groq_api_key = os.environ.get("GROQ_API_KEY")
        if not groq_api_key:
            raise ValueError("GROQ_API_KEY environment variable is not set")

        # Initialize embeddings
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )

        # Load vector store
        try:
            vector_store = FAISS.load_local(
                "embeddings",
                embeddings,
                allow_dangerous_deserialization=True
            )
        except Exception as e:
            raise Exception(f"Failed to load vector store: {str(e)}")

        # Load metadata
        try:
            with open("embeddings/metadata.pkl", "rb") as f:
                metadata = pickle.load(f)
            print(f"Loaded {metadata['num_documents']} documents with {metadata['num_chunks']} chunks")
        except Exception as e:
            raise Exception(f"Failed to load metadata: {str(e)}")

        # Initialize LLM
        llm = ChatGroq(
            api_key=groq_api_key,
            model_name="llama3-70b-8192",
            temperature=0.3,
            max_tokens=4000
        )

        # Initialize memory
        memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

        # Setup prompts
        system_prompt = SystemMessagePromptTemplate.from_template(
            """You are TalentForge AI, a placement and interview expert. First try to answer based on provided context chunks. 
            If no direct context is available or if the context doesn't fully address the question, then use your own knowledge 
            to give the most relevant answer regarding placements, HR queries, and interview guidance. Format your responses 
            using Markdown syntax for better readability. Use tables, code blocks, lists, quotes, and other Markdown features 
            when appropriate."""
        )
        
        human_prompt = HumanMessagePromptTemplate.from_template(
            """Use the following context to answer the question:\n\n{context}\n\nQuestion: {question}\n\n
            If the context doesn't fully address the question or if you need to provide additional information, 
            use your own knowledge to give a comprehensive answer."""
        )

        prompt = ChatPromptTemplate.from_messages([system_prompt, human_prompt])

        # Create conversation chain
        chain = ConversationalRetrievalChain.from_llm(
            llm=llm,
            chain_type='stuff',
            retriever=vector_store.as_retriever(search_kwargs={"k": 5}),
            memory=memory,
            combine_docs_chain_kwargs={'prompt': prompt}
        )

        return chain

    except Exception as e:
        print(f"Error initializing chain: {str(e)}")
        raise

# Initialize conversation chain
try:
    conversation_chain = initialize_chain()
    conversation_history = []
except Exception as e:
    print(f"Failed to initialize conversation chain: {str(e)}")
    conversation_chain = None
    conversation_history = []

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for Render"""
    return jsonify({'status': 'healthy'}), 200

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/ask', methods=['POST'])
def ask():
    try:
        if not conversation_chain:
            return jsonify({
                'error': 'Conversation chain not initialized properly'
            }), 500

        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({
                'error': 'No message provided'
            }), 400

        user_message = data['message']
        if not user_message.strip():
            return jsonify({
                'error': 'Empty message provided'
            }), 400

        # Get response from conversation chain
        result = conversation_chain({
            "question": user_message, 
            "chat_history": conversation_history
        })
        
        answer = result["answer"]
        conversation_history.append((user_message, answer))

        return jsonify({
            'answer': answer
        })

    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500

@app.route('/reset', methods=['POST'])
def reset():
    try:
        global conversation_history
        conversation_history = []
        return jsonify({
            'status': 'success',
            'message': 'Conversation reset successfully'
        })
    except Exception as e:
        return jsonify({
            'error': 'Failed to reset conversation',
            'details': str(e)
        }), 500

if __name__ == '__main__':
    # Get port from environment variable or default to 5000
    port = int(os.environ.get('PORT', 5000))
    
    # Run the app
    app.run(host='0.0.0.0', port=port)