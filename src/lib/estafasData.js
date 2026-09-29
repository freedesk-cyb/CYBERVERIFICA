/**
 * Base de datos educativa y de referencia de estafas comunes en el Perú
 */
export const ESTAFAS_COMUNES = [
  {
    id: 'estafa-1',
    titulo: 'Falsas ofertas de trabajo en TikTok / Amazon / Mercado Libre',
    categoria: 'Laboral',
    nivel_riesgo: 'Alto',
    porcentaje: 98,
    canal: 'WhatsApp / Telegram',
    resumen: 'Te ofrecen ganar entre S/ 150 y S/ 800 diarios solo por dar "me gusta" a videos o calificar productos.',
    mensaje_ejemplo: '¡Hola! Soy Valeria del equipo de RRHH de TikTok Perú. Estamos contratando personal para trabajo a tiempo parcial desde casa. Tu labor será dar likes a creadores. Gana de S/ 200 a S/ 500 al día pagado por Yape o Plin. Escribe al link para empezar ya: bit.ly/tiktok-peru-job',
    modus_operandi: 'Primero te pagan una suma pequeña (S/ 5 o S/ 10) por Yape para ganarse tu confianza. Luego te invitan a un grupo de Telegram donde te exigen "recargar" o depositar dinero para desbloquear tareas VIP con supuestas comisiones altas. Al depositar sumas grandes, bloquean tus fondos y te piden más dinero con la excusa de "descongelamiento de cuenta" o impuestos.',
    senales_alerta: [
      'Números internacionales (+62, +234, +1, +44, +84) contactándote sin haber postulado.',
      'Promesas de sueldos exorbitantes por tareas sin calificación ni esfuerzo real.',
      'Exigencia de transferir tu propio dinero para "avanzar de nivel" o liberar comisiones.',
      'Migración obligatoria y apresurada a grupos cerrados de Telegram.'
    ],
    consejo_accion: 'Nunca deposites dinero para trabajar. Las empresas reales nunca cobran por contratar ni utilizan números no corporativos en WhatsApp.'
  },
  {
    id: 'estafa-2',
    titulo: 'Phishing Bancario BCP / Interbank / BBVA / Banco de la Nación - "Cuenta Bloqueada"',
    categoria: 'Phishing',
    nivel_riesgo: 'Alto',
    porcentaje: 99,
    canal: 'SMS / Correo / WhatsApp',
    resumen: 'Mensajes urgentes que afirman que tu tarjeta, token digital o banca móvil fue bloqueada y debes validar tus datos.',
    mensaje_ejemplo: 'BCP ALERTA: Estimado cliente, su Clave Digital Token ha sido suspendida por actividad inusual. Evite el bloqueo total de sus fondos validando sus datos en: https://bcp-seguridad-bancaenlinea.com/token',
    modus_operandi: 'El enlace te lleva a una página web idéntica a la banca por internet oficial de tu banco. Al ingresar tu número de tarjeta, DNI y clave de internet de 6 dígitos, los ciberdelincuentes acceden a tu cuenta en tiempo real y transfieren todos tus fondos a terceros o billeteras digitales.',
    senales_alerta: [
      'Enlaces web que no terminan en el dominio oficial (.viabcp.com, .interbank.pe, .bbva.pe, .bn.com.pe).',
      'Sentido extremo de urgencia ("tienes 15 minutos o tu cuenta será cancelada definitivamente").',
      'Mensajes recibidos desde números móviles comunes de 9 dígitos en lugar de códigos cortos bancarios.',
      'Solicitud explícita de clave de 6 dígitos, CVV o código SMS / Token Digital.'
    ],
    consejo_accion: 'Los bancos en el Perú NUNCA envían enlaces por SMS para actualizar claves ni te pedirán tu Token Digital o código de seguridad. Entra siempre escribiendo la web oficial directamente en tu navegador.'
  },
  {
    id: 'estafa-3',
    titulo: 'Préstamos inmediatos en Apps extorsivas y "Gota a Gota" digital',
    categoria: 'Financiera',
    nivel_riesgo: 'Alto',
    porcentaje: 95,
    canal: 'Facebook Ads / Play Store / SMS / TikTok',
    resumen: 'Promesa de dinero al instante sin revisar Infocorp, sin aval ni trámites burocráticos.',
    mensaje_ejemplo: '¿Necesitas dinero urgente? ¡Préstamo de S/ 1,000 a S/ 20,000 al instante en tu cuenta! Aprobación en 3 minutos sin mirar Infocorp ni historial. Descarga la app PréstamoFácil y retira ya: bit.ly/prestamo-rapido-pe',
    modus_operandi: 'Al instalar la aplicación en tu celular, te exige permisos para acceder a tus fotos, galería, contactos y ubicación GPS. Te depositan un monto mucho menor al prometido y a los 4 o 5 días te cobran intereses usureros de hasta 500%. Si no pagas, envían mensajes amenazantes y fotos manipuladas a todos tus contactos familiares y laborales.',
    senales_alerta: [
      'Entidades financieras no registradas ante la Superintendencia de Banca, Seguros y AFP (SBS).',
      'Solicitud de acceso total a tus contactos de teléfono, fotos y mensajes de texto.',
      'Plazos de pago engañosos (ofrecen 90 días pero comienzan a cobrar y amenazar al cuarto día).',
      'Cobros de supuestos gastos administrativos previos o deducciones excesivas del desembolso.'
    ],
    consejo_accion: 'Consulta siempre en el portal oficial de la SBS (sbs.gob.pe) si la entidad financiera o cooperativa está debidamente autorizada. Nunca concedas permisos a tus contactos.'
  },
  {
    id: 'estafa-4',
    titulo: 'Falso remate de aduanas o venta irreal de iPhones y Laptops',
    categoria: 'Venta',
    nivel_riesgo: 'Alto',
    porcentaje: 94,
    canal: 'Facebook Marketplace / Instagram / TikTok',
    resumen: 'Perfiles que venden iPhones, PlayStations o laptops a mitad de precio con el pretexto de "liquidación de aduanas".',
    mensaje_ejemplo: 'OFERTA ÚNICA POR REMATE DE ADUANAS: iPhone 15 Pro Max sellado 256GB a solo S/ 1,499 (Precio tienda S/ 5,800). Incluye boleta y garantía de 1 año. Envíos a todo el Perú por Shalom u Olva Courier. Separa el tuyo con 50% de adelanto por Yape al 987654321.',
    modus_operandi: 'Crean perfiles con miles de seguidores comprados y testimonios falsos. Piden un adelanto del 50% o el total mediante Yape, Plin o transferencia bancaria para el supuesto despacho por Shalom u Olva. Una vez recibido el dinero, bloquean al comprador de inmediato o exigen pagos adicionales inventando cobros de "seguro de aduanas".',
    senales_alerta: [
      'Precios 60% o 70% más baratos que el valor real del mercado formal.',
      'Negativa total al pago contraentrega en lugares públicos seguros.',
      'Cuentas bancarias de personas particulares con nombres que no coinciden con la supuesta tienda.',
      'Comentarios restringidos o desactivados en sus publicaciones de redes sociales.'
    ],
    consejo_accion: 'Opta siempre por pago contraentrega en lugares seguros o por tiendas reconocidas formalmente con RUC verificado en SUNAT. Si el precio es demasiado bajo para ser real, es una estafa.'
  },
  {
    id: 'estafa-5',
    titulo: 'El familiar en el extranjero o "Maleta retenida en el aeropuerto Jorge Chávez"',
    categoria: 'Phishing',
    nivel_riesgo: 'Alto',
    porcentaje: 91,
    canal: 'WhatsApp / Facebook Messenger',
    resumen: 'Un estafador se hace pasar por un tío, primo o sobrino en el exterior solicitando ayuda económica urgente.',
    mensaje_ejemplo: 'Hola tío, ¿cómo estás? Soy Carlos, tu sobrino que está en España. Cambié de número temporalmente. Te cuento que estoy enviando unas maletas con regalos y dinero para la familia, pero en aduanas del aeropuerto Jorge Chávez me piden pagar S/ 1,800 de arancel urgente para no decomisarlas. ¿Me puedes prestar hasta que llegue mañana?',
    modus_operandi: 'Obtienen nombres de parientes revisando perfiles públicos de Facebook o Instagram. Simulan tener un vuelo próximo y ponen a un supuesto "funcionario de aduanas" en la línea para presionar a la víctima a depositar en cuentas de terceros.',
    senales_alerta: [
      'Mensaje de un número desconocido diciendo "Hola tía/tío, perdí mi celular y cambié de número".',
      'Urgencia por transferir dinero para supuestos pagos de aranceles de maletas en el aeropuerto.',
      'Excusas para no responder videollamadas o llamadas de voz normales.',
      'Cuentas para depósito bancario a nombre de personas que no guardan ningún vínculo con la familia.'
    ],
    consejo_accion: 'Llama de inmediato al número telefónico habitual que siempre tuviste de tu pariente o consulta con otros familiares antes de realizar cualquier giro o depósito.'
  },
  {
    id: 'estafa-6',
    titulo: 'Falso Bono del Estado o Devolución de SUNAT / Fonavi',
    categoria: 'Phishing',
    nivel_riesgo: 'Alto',
    porcentaje: 97,
    canal: 'SMS / WhatsApp',
    resumen: 'Mensajes con enlaces que afirman que eres beneficiario de un bono económico o devolución de impuestos.',
    mensaje_ejemplo: 'GOBIERNO DEL PERÚ: Has sido seleccionado como beneficiario del Bono Extraordinario 2026 de S/ 760. Consulta tu fecha y lugar de cobro ingresando tus datos de DNI y tarjeta aquí: https://bono-peru-consulta2026.online',
    modus_operandi: 'Aprovechan coyunturas sociales o de crisis económica para crear páginas web idénticas a las del Estado peruano (.gob.pe), solicitando número de DNI, fecha de nacimiento y datos de tarjetas con clave para robar el dinero disponible.',
    senales_alerta: [
      'Enlaces web que no terminan en el dominio oficial del Estado peruano (.gob.pe).',
      'Mensajes no solicitados anunciando subsidios o bonos económicos.',
      'Solicitud obligatoria de números de tarjeta bancaria, fecha de vencimiento o clave web para "depositarte".'
    ],
    consejo_accion: 'Todos los programas y bonos oficiales del Estado peruano se informan única y exclusivamente a través de páginas oficiales que terminan en .gob.pe (por ejemplo: www.gob.pe).'
  },
  {
    id: 'estafa-7',
    titulo: 'Quishing / Códigos QR Falsificados (Parquímetros, Restaurantes, Correos)',
    categoria: 'Phishing',
    nivel_riesgo: 'Alto',
    porcentaje: 97,
    canal: 'QR Físico / Correo / Recibos',
    resumen: 'Stickers con códigos QR fraudulentos pegados sobre códigos reales o enviados en correos para eludir filtros.',
    mensaje_ejemplo: 'Código QR sospechoso detectado (Quishing). Contenido decodificado: https://pago-estacionamiento-lima-rapido.xyz/pagar?token=9281',
    modus_operandi: 'Ciberdelincuentes pegan adhesivos con códigos QR maliciosos sobre los códigos originales de pago en parquímetros, mesas de restaurantes o cajeros. Al escanearlo, redirige a una pasarela clonada que roba el número de tarjeta, fecha de vencimiento y CVV.',
    senales_alerta: [
      'Stickers o adhesivos con relieve pegados sobre la señalética o carta original.',
      'Enlaces que abren dominios extraños (.xyz, .top, .site) en lugar del portal oficial.',
      'Petición de claves secretas o Token Digital para supuestamente "verificar el pago".'
    ],
    consejo_accion: 'Revisa siempre que el código QR esté impreso directamente y verifica el dominio antes de ingresar contraseñas o tarjetas.'
  }
];

export const EJEMPLOS_PRUEBA_RAPIDA = [
  {
    etiqueta: '📱 Falsa Chamba TikTok (S/ 300 al día)',
    texto: '¡Hola! Soy Valeria del equipo de reclutamiento de TikTok Perú. Te ofrecemos empleo remoto dando likes a videos. Gana de S/ 200 a S/ 500 diarios pagados al instante por Yape o Plin. Dale clic al enlace para empezar hoy mismo: bit.ly/trabajo-tiktok-peru'
  },
  {
    etiqueta: '🏦 SMS Falso BCP / Interbank (Alerta)',
    texto: 'BCP ALERTA: Su cuenta bancaria y tarjeta digital han sido bloqueadas preventivamente por seguridad. Para reactivar sus fondos de inmediato, ingrese a validar su clave token en: https://bcp-seguridad-bancaenlinea.com/token'
  },
  {
    etiqueta: '🎯 Quishing / QR Falso (Parquímetro o Correo)',
    texto: 'Código QR sospechoso detectado (Quishing). Contenido decodificado: https://pago-estacionamiento-lima-rapido.xyz/pagar?token=9281 (Sticker pegado sobre máquina de cobro)'
  },
  {
    etiqueta: '💸 Préstamo Gota a Gota (S/ 5,000 sin Infocorp)',
    texto: '¡Préstamo Aprobado al instante! Recibe S/ 5,000 directo en tu cuenta bancaria hoy mismo sin revisar Infocorp ni avales. Descarga la aplicación PréstamoFácil y paga solo S/ 40 de gastos operativos para el desembolso.'
  },
  {
    etiqueta: '🛍️ Remate Aduanas iPhone (Adelanto Yape)',
    texto: 'Vendo iPhone 15 Pro Max nuevo sellado en caja por remate de aduanas a solo S/ 1,499 con boleta y garantía de 1 año. Se envía por Shalom u Olva Courier previo adelanto del 50% por Yape al 987654321. Pocas unidades disponibles.'
  },
  {
    etiqueta: '🧳 Maleta en Aeropuerto Jorge Chávez',
    texto: 'Hola tío, ¿cómo estás? Soy Carlos tu sobrino. Cambié de número. Estoy enviando unas maletas con regalos para la familia desde el extranjero pero aduanas del aeropuerto Jorge Chávez las retuvo y me piden S/ 1,800 urgente de arancel. ¿Me puedes prestar hasta que llegue mañana?'
  },
  {
    etiqueta: '✅ Mensaje Legítimo (Prueba de control)',
    texto: 'Hola Carlos, te paso la lista de las compras para el almuerzo del domingo: papas, pollo, cebolla y limón. ¿A qué hora nos encontramos en el mercado central?'
  }
];
