"""
Azure Platform Support - Streamlit Wrapper for Databricks
This file enables the React/Express app to run in Azure Databricks Streamlit environment
"""

import streamlit as st
import subprocess
import os
import sys
import time
import requests
from pathlib import Path

# Page configuration
st.set_page_config(
    page_title="Azure Platform Support",
    page_icon="☁️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Environment detection
def detect_environment():
    """Detect if running in Databricks, Replit, or Local"""
    if os.getenv("DATABRICKS_RUNTIME_VERSION"):
        return "databricks"
    elif os.getenv("REPL_ID") or os.getenv("REPLIT_DB_URL"):
        return "replit"
    else:
        return "local"

ENV = detect_environment()

# Display environment indicator
with st.sidebar:
    st.markdown("### 🌍 Environment")
    env_colors = {
        "databricks": "🟦 Databricks",
        "replit": "🟩 Replit", 
        "local": "🟨 Local"
    }
    st.info(env_colors.get(ENV, "Unknown"))

# Auto-install dependencies
def ensure_dependencies():
    """Install Node.js dependencies if needed"""
    try:
        if not Path("node_modules").exists():
            with st.spinner("Installing dependencies..."):
                subprocess.run(["npm", "install"], check=True, capture_output=True)
                st.success("✅ Dependencies installed")
    except Exception as e:
        st.error(f"❌ Failed to install dependencies: {e}")

# Start the Express server
@st.cache_resource
def start_server():
    """Start the Express/React server in background"""
    try:
        # Check if server is already running
        try:
            response = requests.get("http://localhost:5000", timeout=1)
            return True
        except:
            pass
        
        # Start server
        process = subprocess.Popen(
            ["npm", "run", "dev"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            env={**os.environ, "NODE_ENV": "production"}
        )
        
        # Wait for server to be ready
        max_attempts = 30
        for i in range(max_attempts):
            try:
                response = requests.get("http://localhost:5000", timeout=1)
                if response.status_code:
                    return True
            except:
                time.sleep(1)
        
        return False
    except Exception as e:
        st.error(f"Failed to start server: {e}")
        return False

# Main app
def main():
    st.title("☁️ Azure Platform Support")
    
    # Install dependencies
    ensure_dependencies()
    
    # Start server
    if start_server():
        st.success("✅ Server is running")
        
        # Embed the React app
        st.markdown("""
        <iframe 
            src="http://localhost:5000" 
            width="100%" 
            height="800px" 
            frameborder="0"
            style="border-radius: 8px; margin-top: 20px;"
        ></iframe>
        """, unsafe_allow_html=True)
        
        # Instructions
        with st.expander("ℹ️ Access Instructions"):
            st.markdown("""
            ### How to Access
            
            **Option 1: Use the embedded app above** ✅ Recommended  
            Navigate and interact with the platform directly in this Streamlit interface.
            
            **Option 2: Direct URL**  
            If the embedded view doesn't work, access directly at:  
            `http://localhost:5000`
            
            ### Demo Credentials
            - **Admin**: admin@demo.com / admin123
            - **Editor**: editor@demo.com / editor123
            - **Viewer**: viewer@demo.com / viewer123
            
            ### Features
            - 📊 **Dashboard**: Real-time Azure platform monitoring
            - 💰 **Cost Analysis**: Azure spending tracking and optimization
            - 🔧 **Resources**: Infrastructure resource management
            - 📄 **Pages**: Custom page builder (Admin/Editor only)
            - 🚨 **Incidents**: ServiceNow ticket tracking
            - 📈 **Jobs**: Databricks job monitoring
            - ⚙️ **Settings**: Platform configuration
            """)
    else:
        st.error("❌ Failed to start the server. Please check logs.")
        
        # Troubleshooting
        with st.expander("🔧 Troubleshooting"):
            st.markdown("""
            ### Common Issues
            
            1. **Port already in use**
               - Check if port 5000 is available
               - Kill existing processes: `lsof -ti:5000 | xargs kill -9`
            
            2. **Dependencies not installed**
               - Run: `npm install`
               - Check Node.js version: `node --version` (should be 18+)
            
            3. **Database connection issues**
               - Check DATABASE_URL environment variable
               - Verify PostgreSQL is running
            
            4. **In Databricks**
               - Ensure all environment variables are set
               - Check Streamlit logs for errors
            """)

if __name__ == "__main__":
    main()
