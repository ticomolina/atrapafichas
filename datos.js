/* =========================================================
   ATRAPA FICHAS — ARCHIVO DE DATOS (editable)
   ---------------------------------------------------------
   Acá se cambian las temáticas, los emojis, los fondos y
   la curva de dificultad. No hace falta tocar nada más.
   Después de editar, subí el número de VERSION en sw.js
   para que las tablets bajen la versión nueva.
   ========================================================= */

window.ATRAPA_DATOS = {

  // Vidas con las que arranca cada partida
  vidas: 5,

  // Cada cuántos niveles cambia la temática (al azar, sin repetir la anterior)
  cambiarTematicaCada: 3,

  // Estrellas por nivel según los errores cometidos en ESE nivel
  estrellas: { sinErrores: 3, unError: 2, masErrores: 1 },

  // Duración del festejo "¡MUY BIEN!" entre niveles (milisegundos)
  duracionFestejo: 2200,

  /* ---------------------------------------------------------
     CURVA DE DIFICULTAD (un renglón por nivel)
     Al pasar el último, se repite el último renglón.

     capas      → cuántos pisos de fichas apiladas
     columnas   → ancho del piso de abajo (en fichas)
     filas      → alto del piso de abajo (en fichas)
     densidad   → qué tan llenos están los pisos de arriba (0 a 1)
     objetivos  → cuántos emojis distintos hay que encontrar (máx. 4)
     cantidad   → [mínimo, máximo] de fichas por cada objetivo
     distintos  → cuántos emojis distintos hay en total en el tablero
     parecidos  → 0 a 1: probabilidad de que los emojis "trampa"
                  sean parecidos a los objetivos (ej: 🐔 y 🐓)
     --------------------------------------------------------- */
  niveles: [
    { capas: 2, columnas: 4, filas: 4, densidad: 0.8,  objetivos: 1, cantidad: [3, 3], distintos: 3, parecidos: 0   }, // 1
    { capas: 2, columnas: 4, filas: 5, densidad: 0.85, objetivos: 1, cantidad: [3, 4], distintos: 4, parecidos: 0   }, // 2
    { capas: 2, columnas: 5, filas: 5, densidad: 0.85, objetivos: 2, cantidad: [2, 3], distintos: 4, parecidos: 0   }, // 3
    { capas: 3, columnas: 5, filas: 5, densidad: 0.85, objetivos: 2, cantidad: [3, 3], distintos: 5, parecidos: 0.1 }, // 4
    { capas: 3, columnas: 5, filas: 6, densidad: 0.9,  objetivos: 2, cantidad: [3, 4], distintos: 5, parecidos: 0.2 }, // 5
    { capas: 3, columnas: 6, filas: 6, densidad: 0.9,  objetivos: 3, cantidad: [2, 3], distintos: 6, parecidos: 0.3 }, // 6
    { capas: 3, columnas: 6, filas: 6, densidad: 0.9,  objetivos: 3, cantidad: [3, 3], distintos: 6, parecidos: 0.4 }, // 7
    { capas: 4, columnas: 6, filas: 6, densidad: 0.9,  objetivos: 3, cantidad: [3, 4], distintos: 7, parecidos: 0.5 }, // 8
    { capas: 4, columnas: 6, filas: 7, densidad: 0.9,  objetivos: 4, cantidad: [2, 3], distintos: 8, parecidos: 0.6 }, // 9
    { capas: 4, columnas: 6, filas: 7, densidad: 0.95, objetivos: 4, cantidad: [3, 4], distintos: 8, parecidos: 0.7 }  // 10+
  ],

  /* ---------------------------------------------------------
     TEMÁTICAS
     emojis    → los que pueden aparecer en el tablero
     parecidos → grupos de emojis que se confunden entre sí
                 (se usan como "trampa" en niveles altos)
     fondo     → cielo: [color arriba, color abajo]
                 suelo: [color loma atrás, color loma adelante]
                 deco:  emojis grandes y transparentes de decoración
                 imagen: opcional, ruta a una imagen propia
                         (ej: "fondos/granja.jpg"). Si está, reemplaza
                         al fondo dibujado.
     --------------------------------------------------------- */
  tematicas: [
    {
      id: "granja", nombre: "GRANJA", icono: "🐮",
      emojis: ["🐄", "🐖", "🐔", "🐑", "🐎", "🐐", "🦆", "🐓", "🐤", "🚜", "🌽", "🥕", "🐇", "🐕", "🏡", "🌻"],
      parecidos: [["🐔", "🐓", "🐤", "🦆"], ["🐄", "🐎", "🐐", "🐑"], ["🌽", "🥕", "🌻"], ["🐇", "🐕", "🐖"]],
      fondo: { cielo: ["#8FD3F4", "#D9F1FB"], suelo: ["#9BD66B", "#6FBF47"], deco: ["☁️", "🌳", "🌻", "☁️"], imagen: null }
    },
    {
      id: "animales", nombre: "ANIMALES", icono: "🐶",
      emojis: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐸", "🐵", "🐧", "🐘", "🦒"],
      parecidos: [["🐯", "🦁", "🐱", "🦊"], ["🐻", "🐼", "🐨"], ["🐭", "🐹", "🐰"], ["🐶", "🐵", "🐸"]],
      fondo: { cielo: ["#FFE29A", "#FFF6D8"], suelo: ["#C7E07A", "#A3CC4E"], deco: ["🌴", "☀️", "🌿", "🌴"], imagen: null }
    },
    {
      id: "comida", nombre: "COMIDA", icono: "🍎",
      emojis: ["🍎", "🍌", "🍇", "🍓", "🍉", "🍊", "🍋", "🍐", "🍒", "🍑", "🍕", "🍔", "🌭", "🍟", "🍩", "🍪", "🧁", "🍦"],
      parecidos: [["🍎", "🍒", "🍓", "🍑"], ["🍊", "🍋", "🍐", "🍌"], ["🍩", "🍪", "🧁", "🍦"], ["🍕", "🍔", "🌭", "🍟"]],
      fondo: { cielo: ["#FFC9D6", "#FFEFF3"], suelo: ["#FFB0C3", "#FF94AE"], deco: ["🍰", "🍭", "🍬", "🧃"], imagen: null }
    },
    {
      id: "mar", nombre: "MAR", icono: "🐠",
      emojis: ["🐟", "🐠", "🐡", "🦈", "🐙", "🦑", "🦀", "🦞", "🐳", "🐬", "🐋", "🐚", "🐢", "🦐", "⚓", "🦭"],
      parecidos: [["🐟", "🐠", "🐡"], ["🐳", "🐋", "🐬", "🦈"], ["🦀", "🦞", "🦐"], ["🐙", "🦑", "🐚"]],
      fondo: { cielo: ["#5EC8F2", "#B8ECFF"], suelo: ["#F6DFA4", "#EDCB7C"], deco: ["💧", "🌊", "🐚", "💧"], imagen: null }
    },
    {
      id: "halloween", nombre: "HALLOWEEN", icono: "🎃",
      emojis: ["🎃", "👻", "🦇", "🕷️", "🕸️", "💀", "🧙", "🧛", "🧟", "🍬", "🍭", "🍫", "🌙", "🔮", "🍄", "🦉"],
      parecidos: [["🍬", "🍭", "🍫"], ["👻", "💀", "🦉"], ["🧙", "🧛", "🧟"], ["🕷️", "🕸️", "🦇"]],
      fondo: { cielo: ["#3B2A6B", "#7A4FA8"], suelo: ["#4A3470", "#2E2050"], deco: ["🌕", "⭐", "🦇", "✨"], imagen: null }
    },
    {
      id: "espacio", nombre: "ESPACIO", icono: "🚀",
      emojis: ["🚀", "🛸", "🌙", "⭐", "🪐", "🌍", "☄️", "👽", "👾", "🛰️", "🌞", "🌟", "💫", "🔭", "🌎", "🌛"],
      parecidos: [["⭐", "🌟", "💫"], ["🌍", "🌎", "🪐"], ["🌙", "🌛", "🌞"], ["👽", "👾", "🛸"], ["🚀", "🛰️", "☄️"]],
      fondo: { cielo: ["#1B1F4B", "#4B3C8F"], suelo: ["#5B4BA0", "#3E3280"], deco: ["✨", "⭐", "🪐", "✨"], imagen: null }
    }
  ]
};
