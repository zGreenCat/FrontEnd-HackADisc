import streamlit as st
import pandas as pd
import requests
import plotly.express as px
from datetime import datetime
from components.navbar import render_navbar

# ------------------------ CONFIG ------------------------
API_URL = "http://localhost:8000"
VALID_STATES = {0, 1, 3}
IGNORE_PREFIXES = ('ADI', 'OTR', 'SPD')

st.set_page_config(layout="wide", page_title="Insecap Dashboard")
render_navbar()

# ------------------------ CARGA DE DATOS ------------------------
@st.cache_data
def fetch_data():
    try:
        ventas = pd.DataFrame(requests.get(f"{API_URL}/comercializaciones").json())
        estados = pd.DataFrame(requests.get(f"{API_URL}/estados").json())
        return ventas, estados
    except Exception as e:
        st.error(f"Error al conectar con el backend: {e}")
        return pd.DataFrame(), pd.DataFrame()

ventas, estados = fetch_data()

if ventas.empty or estados.empty:
    st.stop()

# ------------------------ FILTROS Y VALIDACIÓN ------------------------
ventas = ventas[~ventas["CodigoCotizacion"].str.upper().str.startswith(IGNORE_PREFIXES, na=False)]
ventas["FechaInicio"] = pd.to_datetime(ventas["FechaInicio"], errors="coerce")
estados["Fecha"] = pd.to_datetime(estados["Fecha"], errors="coerce")

def es_valida(id_com):
    estados_com = estados[estados["idComercializacion"] == id_com]
    if estados_com.empty:
        return False
    ultimo = estados_com.loc[estados_com["Fecha"].idxmax()]
    return ultimo["EstadoComercializacion"] in VALID_STATES

ventas["EsValida"] = ventas["id"].apply(es_valida)
ventas_filtradas = ventas[ventas["EsValida"]].copy()
ventas_filtradas["Mes"] = ventas_filtradas["FechaInicio"].dt.to_period("M").astype(str)

# ------------------------ LAYOUT PRINCIPAL ------------------------
col_izq, col_der = st.columns([1.5, 3.5])  

# -------- PANEL IZQUIERDO --------
with col_izq:
    st.markdown("### 📂 Dataset actual")
    st.dataframe(ventas_filtradas.head(10), height=200)
    
    st.divider()
    st.markdown("### 📤 Subir nuevos datos")

    archivo = st.file_uploader("Carga archivo CSV, XLSX o JSON", type=["csv", "xlsx", "json"])
    if archivo:
        try:
            if archivo.name.endswith(".csv"):
                nuevo_df = pd.read_csv(archivo)
            elif archivo.name.endswith(".xlsx"):
                nuevo_df = pd.read_excel(archivo)
            elif archivo.name.endswith(".json"):
                nuevo_df = pd.read_json(archivo)
            else:
                st.warning("Formato no soportado")

            st.success("Archivo cargado correctamente")
            st.dataframe(nuevo_df.head(), height=100)
        except Exception as e:
            st.error(f"Error al leer el archivo: {e}")

# -------- PANEL DERECHO (DASHBOARD GRÁFICO) --------
with col_der:
    st.markdown("## 📊 DASHBOARD")
    mostrar_sence = st.toggle("Filtrar solo SENCE", value=False)
    if mostrar_sence:
        ventas_filtradas = ventas_filtradas[ventas_filtradas["EsSENCE"] == 1]

    # Gráfico principal
    ventas_mensual = ventas_filtradas.groupby("Mes")["ValorVenta"].sum().reset_index()
    fig = px.bar(
        ventas_mensual,
        x="Mes",
        y="ValorVenta",
        title="Monto total vendido por mes",
        color_discrete_sequence=["#485CC7"]
    )
    st.plotly_chart(fig, use_container_width=True, height=300)

# ------------------------ MÉTRICAS ABAJO ------------------------
st.divider()
st.subheader("📈 Métricas del dataset")