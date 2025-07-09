import streamlit as st
import pandas as pd
import plotly.express as px
from datetime import datetime

# Cargar datos
ventas = pd.read_csv("ventas.csv")
estados = pd.read_csv("estados.csv")

# --- Filtros centrales ---
VALID_STATES = {0, 1, 3}
IGNORE_PREFIXES = ('ADI', 'OTR', 'SPD')

# 1. Excluir cotizaciones inválidas
ventas = ventas[~ventas["CodigoCotizacion"].str.upper().str.startswith(IGNORE_PREFIXES, na=False)]

# 2. Parsear fechas
ventas["FechaInicio"] = pd.to_datetime(ventas["FechaInicio"], dayfirst=True, errors="coerce")
estados["Fecha"] = pd.to_datetime(estados["Fecha"], dayfirst=True, errors="coerce")

# 3. Filtrar por último estado válido
def es_valida(id_com):
    estados_com = estados[estados["idComercializacion"] == id_com]
    if estados_com.empty:
        return False
    ultimo = estados_com.loc[estados_com["Fecha"].idxmax()]
    return ultimo["EstadoComercializacion"] in VALID_STATES

ventas["EsValida"] = ventas["idComercializacion"].apply(es_valida)
ventas_filtradas = ventas[ventas["EsValida"]]

# ------------------------ STREAMLIT ------------------------

st.title("Dashboard de Ventas - Insecap")

# Monto total vendido por mes (ventas válidas)
ventas_filtradas["Mes"] = ventas_filtradas["FechaInicio"].dt.to_period("M")
ventas_mensual = ventas_filtradas.groupby("Mes")["ValorVenta"].sum().reset_index()
ventas_mensual["Mes"] = ventas_mensual["Mes"].astype(str)

fig1 = px.bar(ventas_mensual, x="Mes", y="ValorVenta", title="Monto total vendido por mes (ventas válidas)")
st.plotly_chart(fig1)