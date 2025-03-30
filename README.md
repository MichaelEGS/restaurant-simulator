markdown
Copy
# 🍕 Simulador de Restaurante Interactivo

[![CI/CD Status](https://github.com/MichaelEGS/restaurant-simulator/actions/workflows/ci-cd-pipeline.yml/badge.svg)](https://github.com/MichaelEGS/restaurant-simulator/actions)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-blue)](https://michaelegs.github.io/restaurant-simulator)

Un sistema de simulación completo para gestionar pedidos, mesas y operaciones de restaurante con interfaz web interactiva.

![Interfaz del Simulador de Restaurante](./documents/imag/screenshot.png)
<p>
  <img src="./documents/img/Screenshot.png" alt="Captura del sistema" width="800">
</p>
<p>
  <img src="./documents/img/Screenshot2.png" alt="Captura del sistema" width="800">
</p>

## 🚀 Características Principales
- 📊 Generación automática de pedidos (Local, Para llevar, Domicilio)
- ⏱ Temporizador de simulación en tiempo real
- 🧑🍳 Gestión de tiempos de preparación (15s-1min)
- 📈 Sistema de facturación integrado
- 🪑 Administración inteligente de mesas
- 📱 Interfaz responsive con controles intuitivos

## 🛠 Tecnologías Utilizadas
- Frontend: HTML5, CSS3, JavaScript ES6+
- Tooling: ESLint, GitHub Actions
- Hosting: GitHub Pages

## 📦 Instalación Local
1. Clona el repositorio:
```bash
git clone https://github.com/MichaelEGS/restaurant-simulator.git
Instala dependencias:


npm install
Inicia servidor de desarrollo:


npm run dev
🌍 Uso en Producción
El sistema se despliega automáticamente en GitHub Pages con cada actualización de la rama main:
🔗 Ver Demo en Vivo

🛠️ Pipeline CI/CD
Nuestro flujo automatizado incluye:

✅ Validación de código con ESLint

🧪 Pruebas de integración (próximamente)

🚀 Despliegue automático en GitHub Pages

graph TD
    A[Push a main] --> B{Ejecutar CI/CD}
    B --> C[Lint y Build]
    C --> D{¿Es main?}
    D -->|Sí| E[Desplegar en GitHub Pages]
    D -->|No| F[Finalizar]

🤝 Cómo Contribuir
Crea un fork del proyecto
Crea tu rama de feature:
git checkout -b feature/nueva-funcionalidad

Haz commit de tus cambios:
git commit -m "feat: añade nueva funcionalidad"

Haz push a la rama:
git push origin feature/nueva-funcionalidad
Abre un Pull Request en GitHub

📄 Licencia
Distribuido bajo licencia MIT. Ver LICENSE para más detalles.

👨💻 Equipo de Desarrollo:
Michael (Infraestructura) | Jesús & Steven (Lógica) | Jhon Daniel (Diseño)


### Características clave de esta actualización:
1. **Badges Dinámicos**: Muestra el estado del CI/CD y enlace al deploy
2. **Diagrama de Flujo CI/CD**: Visualización Mermaid del proceso
3. **Instrucciones Claras**:
   - Instalación local con npm
   - Enlace directo a la demo en vivo
   - Pasos detallados para contribuir
4. **Responsive Design**: Listo para verse bien en móviles y desktop
5. **Team Section**: Créditos claros al equipo
