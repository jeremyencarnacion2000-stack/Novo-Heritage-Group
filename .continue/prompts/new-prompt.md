---
# Prompt 1: Generar tests unitarios
name: "Generate Unit Tests"
description: "Crea una suite completa de tests unitarios, cubriendo todos los edge cases relevantes."
invokable: true
content: |
  Please write a thorough suite of unit tests for this code, making sure to cover all relevant edge cases.
---

# Prompt 2: Resumir repositorio
name: "Summarize Repo"
description: "Explora el proyecto y genera un resumen conciso de su contenido."
invokable: true
content: |
  Explore this repo and provide a concise summary of its contents.
---

# Prompt 3: Detectar y corregir errores
name: "Fix Project Errors"
description: "Revisa todos los archivos del proyecto, detecta errores de sintaxis, dependencias y lógica, y aplica correcciones automáticas."
invokable: true
content: |
  You have full access to the project files. Detect all syntax, import, dependency, and logic errors, correct them safely, and generate a report of changes.
