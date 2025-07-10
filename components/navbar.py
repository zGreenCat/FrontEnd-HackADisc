import streamlit as st
import base64

LOGO_PATH = "assets/Insecap_Logo-07.png"

def image_to_base64(path):
    with open(path, "rb") as img:
        return base64.b64encode(img.read()).decode()

def render_navbar():
    logo_base64 = image_to_base64(LOGO_PATH)

    st.markdown(f"""
    <style>
    .navbar {{
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 999;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: linear-gradient(to right, #00B8DE, #485CC7);
        padding: 0.5rem 2rem;
        height: 60px;
    }}
    .navbar-left img {{
        height: 38px;
    }}
    .navbar-right {{
        display: flex;
        gap: 2rem;
        align-items: center;
        color: white;
        font-weight: 600;
        font-family: 'Montserrat', sans-serif;
        font-size: 0.9rem;
    }}
    .navbar-button {{
        background: white;
        color: #485CC7;
        border-radius: 6px;
        padding: 0.4rem 1rem;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        text-decoration: none;
    }}
    .stApp {{
        padding-top: 75px !important;  /* para que el contenido no quede oculto debajo */
    }}
    </style>

    <div class="navbar">
        <div class="navbar-left">
            <img src="data:image/png;base64,{logo_base64}">
        </div>
        <div class="navbar-right">
            <span>Inicio</span>
            <span>Cursos</span>
            <span>Nosotros</span>
            <span>Contacto</span>
        </div><<
    </div>
    """, unsafe_allow_html=True)