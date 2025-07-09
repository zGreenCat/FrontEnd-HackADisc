import streamlit as st
import pandas as pd
import plotly.express as px
import requests
from datetime import datetime

# ------------------------ CONFIG ------------------------
API_URL = "http://localhost:8000"

VALID_STATES = {0, 1, 3}
IGNORE_PREFIXES = ('ADI', 'OTR', 'SPD')

# ------------------------ CARGA DE DATOS ------------------------
@st.cache_data
def fetch_data():
    try:
        r1 = requests.get(f"{API_URL}/comercializaciones")
        r2 = requests.get(f"{API_URL}/estados")
        df_ventas = pd.DataFrame(r1.json())
        df_estados = pd.DataFrame(r2.json())
        return df_ventas, df_estados
    except Exception as e:
        st.error(f"Error al conectar con el backend: {e}")
        return pd.DataFrame(), pd.DataFrame()

ventas, estados = fetch_data()

if ventas.empty or estados.empty:
    st.stop()

# ------------------------ FILTROS ------------------------

# 1. Excluir prefijos ignorados
ventas = ventas[~ventas["CodigoCotizacion"].str.upper().str.startswith(IGNORE_PREFIXES, na=False)]

# 2. Parseo de fechas
ventas["FechaInicio"] = pd.to_datetime(ventas["FechaInicio"], errors="coerce")
estados["Fecha"] = pd.to_datetime(estados["Fecha"], errors="coerce")

# 3. Validación por último estado
def es_valida(id_com):
    estados_com = estados[estados["idComercializacion"] == id_com]
    if estados_com.empty:
        return False
    ultimo = estados_com.loc[estados_com["Fecha"].idxmax()]
    return ultimo["EstadoComercializacion"] in VALID_STATES

ventas["EsValida"] = ventas["id"].apply(es_valida)
ventas_filtradas = ventas[ventas["EsValida"]]

# ------------------------ STREAMLIT ------------------------

st.title("Dashboard de Ventas - Insecap")

# Monto total vendido por mes (ventas válidas)
ventas_filtradas.loc[:, "Mes"] = ventas_filtradas["FechaInicio"].dt.to_period("M").astype(str)
ventas_mensual = ventas_filtradas.groupby("Mes")["ValorVenta"].sum().reset_index()

fig1 = px.bar(ventas_mensual, x="Mes", y="ValorVenta", title="Monto total vendido por mes (ventas válidas)")
st.plotly_chart(fig1)