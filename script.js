/* =========================================================
   Itxaso Gurrea · script.js
   - Menú móvil
   - Cabecera al hacer scroll + enlace activo
   - Animaciones de aparición
   - Contador de cifras
   - FAQ con buscador y filtros
   - Validación del formulario de contacto
   ========================================================= */

/* ---------- Preguntas frecuentes ---------- */
const FAQ_CATEGORIES = {
  general: "Coaching en general",
  itxaso: "Sobre Itxaso",
  individual: "Coaching 1:1",
  vida: "Vida y autoestima",
  circulo: "Círculo PRO",
  sinergia: "Sinergia Líder",
  cursos: "Cursos y seminarios",
  precios: "Precios y contratación",
  dudas: "Expectativas y dudas",
};

const FAQ = [
  // SOBRE EL COACHING EN GENERAL
  { c: "general", q: "¿Qué es el coaching ejecutivo y de vida?", a: "El coaching es un proceso de acompañamiento profesional que te ayuda a identificar dónde estás, dónde quieres llegar y qué te está frenando. El coaching ejecutivo se centra en el desarrollo del liderazgo, la toma de decisiones y el rendimiento profesional. El coaching de vida trabaja áreas como la autoestima, la gestión emocional, las relaciones y el propósito personal. En mi caso, combino ambos porque he comprobado que la vida personal y la profesional están profundamente conectadas: no puedes liderar con claridad si por dentro hay caos." },
  { c: "general", q: "¿En qué se diferencia el coaching de la terapia psicológica?", a: "La terapia suele centrarse en sanar heridas del pasado y tratar trastornos clínicos. El coaching, en cambio, parte del presente y mira hacia el futuro: trabaja con personas funcionales que quieren mejorar, crecer o desbloquearse. No diagnostico ni trato patologías. Si durante un proceso detecto que una persona necesita apoyo terapéutico, lo recomiendo abiertamente. Son disciplinas complementarias, no excluyentes." },
  { c: "general", q: "¿El coaching es lo mismo que la mentoría o la consultoría?", a: "No. Un mentor te aconseja desde su experiencia. Un consultor te da soluciones concretas para problemas técnicos. Un coach te acompaña para que encuentres tus propias respuestas, desarrolles tus recursos internos y tomes decisiones con autonomía. Dicho esto, con más de 30 años de experiencia, en mis sesiones también aporto visión estratégica cuando es necesario. No me limito a hacer preguntas: te doy herramientas reales." },
  { c: "general", q: "¿Necesito tener un problema grave para acudir a un coach?", a: "En absoluto. Muchas personas acuden a coaching no porque estén mal, sino porque quieren estar mejor. Quieren más claridad, más enfoque, más equilibrio o dar un salto en su carrera o negocio. El coaching no es solo para momentos de crisis: es una inversión en tu desarrollo y tu bienestar. De hecho, las personas que mejores resultados obtienen suelen ser las que llegan con ganas de crecer, no solo de sobrevivir." },
  { c: "general", q: "¿Qué resultados puedo esperar de un proceso de coaching?", a: "Depende de tu punto de partida y tu nivel de compromiso, pero los resultados más habituales incluyen: mayor claridad para tomar decisiones, mejor gestión del estrés y las emociones, aumento de la autoestima y la seguridad personal, mejora en la comunicación y las relaciones, mayor enfoque y productividad, y una sensación real de que llevas el mando de tu vida. No prometo fórmulas mágicas, pero sí un proceso honesto con herramientas que funcionan." },
  { c: "general", q: "¿El coaching está respaldado por alguna base científica?", a: "Sí. Mi metodología se apoya en tres pilares con amplio respaldo científico: la Programación Neurolingüística (PNL), la Inteligencia Emocional y la Psicología Positiva. Son disciplinas que llevan décadas estudiándose y aplicándose en contextos clínicos, educativos y empresariales. No trabajo con modas ni con pseudociencia: trabajo con lo que funciona y está probado." },

  // SOBRE ITXASO GURREA
  { c: "itxaso", q: "¿Qué formación y experiencia tiene Itxaso Gurrea?", a: "Cuento con más de 30 años de experiencia acompañando personas y organizaciones en procesos de cambio. He facilitado más de 2.000 procesos de transformación personal y profesional. Mi formación incluye especialización en PNL, Inteligencia Emocional y Psicología Positiva. Sigo formándome cada año porque creo que un buen coach nunca deja de aprender." },
  { c: "itxaso", q: "¿Qué metodologías utiliza Itxaso en sus sesiones?", a: "Combino herramientas de PNL, Inteligencia Emocional y Psicología Positiva con una visión estratégica de negocio. Cada proceso es diferente, así que adapto las herramientas a lo que la persona necesita en cada momento. No aplico recetas: diseño itinerarios a medida." },
  { c: "itxaso", q: "¿Qué significa que trabaje con PNL, Inteligencia Emocional y Psicología Positiva?", a: "La PNL (Programación Neurolingüística) me permite trabajar con los patrones mentales y lingüísticos que condicionan tu comportamiento. La Inteligencia Emocional te ayuda a reconocer, entender y gestionar tus emociones para tomar mejores decisiones. La Psicología Positiva pone el foco en tus fortalezas, no en tus carencias. Juntas, forman un enfoque potente, práctico y orientado a resultados." },
  { c: "itxaso", q: "¿Qué papel juega la autoestima en el enfoque de Itxaso?", a: "Es el eje central de todo mi trabajo. Después de acompañar a miles de personas, he comprobado que la autoestima es el verdadero motor del éxito. Sin una base sólida de confianza en ti, ni la mejor estrategia de negocio funciona. Cuando trabajas tu autoestima profesional, tomas decisiones con más seguridad, lideras con más presencia y disfrutas más de lo que haces. Todo empieza ahí." },
  { c: "itxaso", q: "¿Itxaso trabaja solo con profesionales del sector belleza o con cualquier persona?", a: "Trabajo con cualquier persona o equipo que quiera crecer. Dicho esto, tengo una especialización muy concreta en el sector de la belleza y la estética a través de programas como Círculo PRO. Si tienes un salón, una clínica estética o un negocio relacionado con el bienestar, puedo ofrecerte un acompañamiento muy específico. Pero mi metodología es universal: la aplico con éxito en líderes, emprendedores y profesionales de todos los sectores." },

  // SOBRE EL PROCESO 1:1
  { c: "individual", q: "¿Cómo funciona un proceso de coaching personalizado con Itxaso?", a: "Todo empieza con una entrevista gratuita donde escucho tu situación, tus objetivos y tus retos. A partir de ahí, diseño un plan de acompañamiento a medida con sesiones periódicas (normalmente quincenales o mensuales). En cada sesión trabajamos con herramientas concretas, reflexiones guiadas y planes de acción. Entre sesiones, tú aplicas lo trabajado en tu vida real. Es un proceso activo: yo pongo las herramientas, tú pones el compromiso." },
  { c: "individual", q: "¿Cuántas sesiones necesito para ver resultados?", a: "Muchas personas notan cambios desde las primeras sesiones: más claridad, más calma, mejores decisiones. Un proceso completo suele durar entre 8 y 12 sesiones, aunque depende de la complejidad de tu situación y tus objetivos. No creo en los procesos eternos. Mi objetivo es que ganes autonomía, no que dependas de mí." },
  { c: "individual", q: "¿Cuánto dura cada sesión de coaching?", a: "Las sesiones individuales duran entre 60 y 90 minutos, dependiendo del tipo de proceso y de lo que estemos trabajando en cada momento. Es tiempo suficiente para profundizar, trabajar con herramientas y definir un plan de acción concreto para el periodo entre sesiones." },
  { c: "individual", q: "¿Las sesiones son presenciales u online?", a: "Ambas opciones están disponibles. Las sesiones online funcionan igual de bien y me permiten acompañar a personas de cualquier parte del mundo. Las presenciales están disponibles según ubicación y agenda. En la entrevista gratuita valoramos juntos qué formato se adapta mejor a tu situación." },
  { c: "individual", q: "¿Qué pasa en la primera sesión?", a: "La primera sesión es un espacio para conocernos en profundidad. Exploramos tu situación actual, tus objetivos, lo que te frena y lo que te motiva. También definimos cómo vamos a trabajar juntos: frecuencia, formato, expectativas. Es el momento en el que construimos la base de confianza que hará que el proceso funcione. No hay juicios, solo escucha activa y un plan claro." },
  { c: "individual", q: "¿Puedo hacer coaching si vivo fuera de España?", a: "Por supuesto. Trabajo con personas de diferentes países a través de videollamada. La distancia no es un obstáculo: lo que importa es tu compromiso con el proceso. Solo necesitas una conexión estable, un espacio tranquilo y ganas de avanzar." },
  { c: "individual", q: "¿Qué compromiso se requiere de mi parte durante el proceso?", a: "El coaching solo funciona si tú participas activamente. Eso significa asistir a las sesiones, reflexionar entre ellas y aplicar lo que trabajamos en tu día a día. No te voy a pedir que hagas nada que no tenga sentido para ti, pero sí necesito que estés dispuesto a mirar hacia dentro, a cuestionar creencias y a pasar a la acción. Mi parte es guiarte; tu parte es caminar." },
  { c: "individual", q: "¿Qué diferencia hay entre el coaching de vida y el coaching ejecutivo que ofreces?", a: "El coaching de vida se centra en tu bienestar personal: autoestima, relaciones, propósito, gestión emocional, toma de decisiones vitales. El coaching ejecutivo trabaja el liderazgo, el rendimiento profesional, la gestión de equipos y la estrategia de carrera o negocio. En la práctica, muchos procesos combinan ambos, porque lo que te pasa en el trabajo afecta a tu vida y viceversa. Mi enfoque integra las dos dimensiones de forma natural." },

  // COACHING DE VIDA Y AUTOESTIMA
  { c: "vida", q: "¿Cómo puede ayudarme el coaching a mejorar mi autoestima?", a: "La autoestima no se construye con frases motivacionales, sino con acciones coherentes. En coaching trabajamos para que identifiques tus creencias limitantes, reconozcas tu valor real, establezcas límites sanos y tomes decisiones alineadas con quien quieres ser. Cuando empiezas a actuar desde la confianza en lugar del miedo, tu autoestima crece de forma natural y sostenida." },
  { c: "vida", q: "¿Qué tipo de bloqueos se pueden trabajar en coaching de vida?", a: "Bloqueos en la toma de decisiones, miedo al cambio, síndrome del impostor, dificultad para poner límites, procrastinación, falta de propósito o motivación, relaciones que te desgastan, estrés crónico, sensación de estar \"en piloto automático\"... Son algunos de los más habituales. Si sientes que algo te frena pero no sabes exactamente qué es, esa es precisamente una buena razón para empezar un proceso." },
  { c: "vida", q: "¿El coaching me puede ayudar a tomar decisiones importantes con más seguridad?", a: "Sí, y es uno de los motivos más frecuentes por los que las personas acuden a mí. Trabajamos para que entiendas qué valores y emociones están detrás de tu indecisión, analices las opciones con claridad y actúes con determinación. No te digo lo que tienes que hacer: te ayudo a que lo descubras tú, con toda la información sobre la mesa y confiando en tu criterio." },
  { c: "vida", q: "¿Puedo trabajar el estrés y la ansiedad con coaching?", a: "El coaching puede ayudarte a gestionar el estrés y a identificar las causas que lo generan: sobrecarga, falta de límites, perfeccionismo, falta de organización o prioridades desalineadas. Trabajamos con herramientas prácticas de gestión emocional y planificación estratégica. Si la ansiedad es clínica o muy intensa, te recomendaré combinar el coaching con acompañamiento psicológico especializado." },
  { c: "vida", q: "¿Qué son los cursos de autoestima y cómo funcionan?", a: "Son programas formativos diseñados para trabajar la autoestima de forma práctica y estructurada. Incluyen contenidos sobre autoconocimiento, gestión emocional, creencias limitantes, comunicación asertiva y toma de decisiones. Pueden realizarse de forma individual o en grupo, y combinan teoría, ejercicios prácticos y reflexión guiada. Son una opción excelente si quieres empezar a trabajar en ti sin necesariamente hacer un proceso de coaching largo." },

  // CÍRCULO PRO
  { c: "circulo", q: "¿Qué es el programa Círculo PRO?", a: "Círculo PRO es un programa de acompañamiento exclusivo para profesionales y propietarios de negocios de belleza que quieren elevar su negocio al siguiente nivel. Combina coaching de liderazgo y estrategia empresarial aplicados a la gestión, la comunicación y la captación de clientes. No es solo formación: es un espacio de crecimiento integral para convertirte en la líder referente que tu negocio necesita." },
  { c: "circulo", q: "¿A quién va dirigido Círculo PRO?", a: "A propietarias y directoras de salones de belleza, centros de estética, spas y negocios del sector bienestar que quieran profesionalizar su gestión, innovar con herramientas digitales y liderar con más seguridad y coherencia. También es para profesionales que sienten que su negocio ha llegado a un techo y necesitan una visión nueva para seguir creciendo." },
  { c: "circulo", q: "¿Qué beneficios concretos obtendré para mi negocio de belleza?", a: "Mayor rentabilidad, mejor organización, captación de clientes más eficiente, comunicación digital profesional, liderazgo más sólido, reducción del estrés en la gestión diaria y una visión estratégica clara para tu negocio. Mis clientes consiguen trabajar menos horas con mejores resultados porque optimizan procesos y toman decisiones desde la claridad, no desde la urgencia." },
  { c: "circulo", q: "¿Círculo PRO es una formación puntual o un acompañamiento continuo?", a: "Es un programa con estructura definida, pero diseñado para generar un impacto sostenido. Incluye formación, acompañamiento y seguimiento para que los cambios se integren de verdad en tu día a día. No es un curso que haces y olvidas: es un proceso de transformación real con el apoyo necesario para que los resultados perduren." },

  // SINERGIA LÍDER
  { c: "sinergia", q: "¿Qué es el programa Sinergia Líder?", a: "Sinergia Líder es un programa de desarrollo para equipos que quieren funcionar a un nivel superior. Trabajamos la cohesión, la comunicación efectiva, el liderazgo compartido y la alineación con los objetivos de la organización. El resultado es un equipo más comprometido, más productivo y con una cultura interna que potencia los resultados del negocio." },
  { c: "sinergia", q: "¿A qué tipo de empresas o equipos va dirigido?", a: "A cualquier organización que quiera mejorar el rendimiento y la satisfacción de sus equipos. He trabajado con equipos pequeños de 4-5 personas y con organizaciones más grandes. Lo importante no es el tamaño, sino la voluntad de mejorar. Si sientes que tu equipo no funciona como debería, que hay conflictos recurrentes o que falta motivación, Sinergia Líder puede ser el catalizador del cambio." },
  { c: "sinergia", q: "¿Cómo mejora Sinergia Líder la rentabilidad de una empresa?", a: "Un equipo que se comunica bien, que confía entre sí y que tiene objetivos claros es un equipo que rinde más, comete menos errores y retiene mejor el talento. La mejora de la rentabilidad no viene solo de vender más: viene de reducir fricciones internas, optimizar procesos humanos y crear un entorno donde las personas den lo mejor de sí mismas. Eso tiene un impacto directo en la cuenta de resultados." },
  { c: "sinergia", q: "¿Qué temas se trabajan en un programa de equipos de alto rendimiento?", a: "Comunicación efectiva, resolución de conflictos, liderazgo compartido, gestión emocional en equipo, alineación de objetivos, confianza y cohesión grupal, cultura de feedback constructivo y planificación estratégica colaborativa. Cada programa se adapta a la realidad y las necesidades específicas del equipo." },
  { c: "sinergia", q: "¿Se puede adaptar el programa a las necesidades específicas de mi organización?", a: "Siempre. No trabajo con programas enlatados. Antes de empezar, hago un diagnóstico de la situación del equipo y de los objetivos de la empresa. A partir de ahí, diseño un itinerario a medida que aborde exactamente lo que tu equipo necesita. Es la única forma de garantizar resultados reales." },

  // SEMINARIOS Y CURSOS
  { c: "cursos", q: "¿Qué tipo de cursos y seminarios ofrece Itxaso?", a: "Ofrezco formaciones ágiles y directas sobre temas como liderazgo, autoestima profesional, gestión emocional, comunicación asertiva, mentalidad de ventas, motivación de equipos, resolución de conflictos y digitalización de negocios. Son herramientas de impacto rápido que puedes aplicar desde el primer minuto. Consulta el catálogo actualizado en la sección de Servicios de la web." },
  { c: "cursos", q: "¿Los cursos son online, presenciales o ambos?", a: "Depende del curso y del formato. Ofrezco opciones online, presenciales y mixtas. Los cursos online te permiten formarte a tu ritmo desde cualquier lugar. Los presenciales y los seminarios tienen la ventaja de la interacción directa y la energía grupal. En la descripción de cada curso encontrarás el formato disponible." },
  { c: "cursos", q: "¿Puedo contratar una formación personalizada para mi empresa?", a: "Sí. Diseño programas formativos a medida para empresas sobre cualquier reto que se pueda abordar desde el coaching y el desarrollo de personas: ventas, motivación, comunicación, conflictos, liderazgo, gestión del cambio y más. Solo tienes que agendar una llamada gratuita y me cuentas qué necesitas. A partir de ahí, te presento una propuesta adaptada." },
  { c: "cursos", q: "¿Qué temas se pueden abordar en un programa a medida?", a: "Prácticamente cualquier reto humano dentro de una organización: mentalidad de ventas, motivación, comunicación interna, liderazgo, resolución de conflictos, gestión del estrés, cohesión de equipos, atención al cliente, adaptación al cambio digital... Si hay un reto o una circunstancia que se pueda mejorar trabajando con las personas, podemos diseñar algo específico para ti." },
  { c: "cursos", q: "¿Los cursos incluyen material de apoyo o seguimiento posterior?", a: "Sí. Todos los cursos incluyen material de trabajo y recursos prácticos. Dependiendo del programa, también ofrezco seguimiento posterior para asegurar que lo aprendido se integra en el día a día. Mi objetivo no es que apuntes cosas bonitas en un cuaderno: es que las apliques y que funcionen." },

  // PRECIOS, LOGÍSTICA Y CONTRATACIÓN
  { c: "precios", q: "¿Cuánto cuesta un proceso de coaching con Itxaso?", a: "La inversión varía según el tipo de servicio: coaching individual, programas grupales, cursos temáticos o programas para empresas. Cada proceso se diseña a medida, por lo que el presupuesto se ajusta a tus necesidades y objetivos. En la entrevista gratuita te explico las opciones y las tarifas con total transparencia, sin compromiso." },
  { c: "precios", q: "¿Cómo puedo reservar una primera entrevista gratuita?", a: "Muy fácil. Solo tienes que hacer clic en el botón \"Reservar entrevista gratuita\" que encontrarás en la web y elegir el día y la hora que mejor te venga a través de mi calendario online. En unos minutos, recibirás la confirmación. Sin formularios eternos ni esperas." },
  { c: "precios", q: "¿La entrevista inicial es realmente gratuita y sin compromiso?", a: "Totalmente. La entrevista es un espacio para conocernos, entender tu situación y valorar juntos si tiene sentido trabajar conmigo. No hay presión, no hay venta agresiva, no hay letra pequeña. Si después de la entrevista decides que no es tu momento o que no encajamos, no pasa absolutamente nada. Prefiero que empieces convencido a que empieces por compromiso." },
  { c: "precios", q: "¿Qué formas de pago se aceptan?", a: "Acepto transferencia bancaria y otras formas de pago que se concretan al formalizar el servicio. Para programas de mayor inversión, podemos acordar facilidades de pago. Todo se habla de forma transparente antes de empezar." },
  { c: "precios", q: "¿Puedo cancelar o reprogramar una sesión?", a: "Sí, con un aviso previo razonable (normalmente 24-48 horas). Entiendo que la vida a veces cambia los planes. Lo que sí te pido es compromiso con el proceso: las cancelaciones recurrentes afectan al ritmo y a los resultados. Acordamos las condiciones específicas al inicio del proceso." },
  { c: "precios", q: "¿La información que comparto en las sesiones es confidencial?", a: "Absolutamente. La confidencialidad es uno de los pilares fundamentales del coaching. Todo lo que compartas conmigo en las sesiones queda entre nosotros. Es un espacio seguro donde puedes ser completamente honesto sin miedo a juicios. Sin confianza no hay proceso, y sin confidencialidad no hay confianza." },

  // EXPECTATIVAS Y DUDAS COMUNES
  { c: "dudas", q: "¿Cómo sé si el coaching es lo que realmente necesito en este momento?", a: "Si sientes que estás estancado, que quieres más de tu vida o tu carrera pero no sabes por dónde empezar, que tomas decisiones desde el miedo o la inercia, o simplemente que algo no encaja aunque \"todo vaya bien\"... probablemente el coaching sea exactamente lo que necesitas. La mejor forma de salir de dudas es reservar la entrevista gratuita: en 30 minutos sabrás si este es tu camino." },
  { c: "dudas", q: "¿Qué pasa si siento que no avanzo durante el proceso?", a: "Hablamos. La comunicación abierta es esencial en un proceso de coaching. Si en algún momento sientes que no estás avanzando, lo abordamos juntos: revisamos objetivos, ajustamos el enfoque o exploramos qué puede estar frenándote. A veces los momentos de aparente estancamiento son precisamente los previos a los mayores avances. Mi compromiso es ser honesta contigo, también si creo que necesitas un enfoque diferente al coaching." },
  { c: "dudas", q: "¿Puedo combinar varios servicios (coaching individual + curso + Círculo PRO)?", a: "Por supuesto, y de hecho es algo que muchos de mis clientes hacen. Cada servicio aborda una dimensión diferente de tu crecimiento, y combinarlos potencia los resultados. En la entrevista gratuita podemos diseñar un plan integral que se ajuste a tus objetivos, tu ritmo y tu presupuesto. El objetivo siempre es el mismo: que avances con coherencia y sentido." },
];

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Año en el pie ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Menú móvil ---------- */
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");

  const closeMenu = () => {
    nav.classList.remove("is-open");
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menú");
  };

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  });
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeMenu());

  /* ---------- Cabecera y botón "arriba" al hacer scroll ---------- */
  const header = document.getElementById("header");
  const toTop = document.getElementById("toTop");
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 20);
    toTop.classList.toggle("is-visible", y > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Enlace activo según la sección visible ---------- */
  const navLinks = [...nav.querySelectorAll('a:not(.btn)[href^="#"]')];
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) =>
          a.classList.toggle("is-active", a.getAttribute("href") === `#${entry.target.id}`)
        );
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => sectionObserver.observe(s));

  /* ---------- Animación de aparición ---------- */
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  /* ---------- Contador de cifras ---------- */
  const formatNumber = (n) => n.toLocaleString("es-ES");
  const countObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.count);
        const prefix = el.dataset.prefix || "";
        const duration = 1600;
        const start = performance.now();

        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = prefix + formatNumber(Math.round(target * eased));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    },
    { threshold: 0.6 }
  );
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll("[data-count]").forEach((el) => countObserver.observe(el));
  }

  /* ---------- FAQ: render, buscador y filtros ---------- */
  const faqList = document.getElementById("faqList");
  const faqSearch = document.getElementById("faqSearch");
  const faqFilters = document.getElementById("faqFilters");
  const faqEmpty = document.getElementById("faqEmpty");
  let activeCat = "all";

  const normalize = (s) =>
    s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  // Filtros
  const filters = [["all", "Todas"], ...Object.entries(FAQ_CATEGORIES)];
  filters.forEach(([key, label]) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "faq-filter" + (key === "all" ? " is-active" : "");
    btn.textContent = label;
    btn.dataset.cat = key;
    btn.addEventListener("click", () => {
      activeCat = key;
      faqFilters.querySelectorAll(".faq-filter").forEach((b) =>
        b.classList.toggle("is-active", b === btn)
      );
      renderFaq();
    });
    faqFilters.appendChild(btn);
  });

  // Elementos de pregunta
  const faqItems = FAQ.map((item, i) => {
    const wrap = document.createElement("div");
    wrap.className = "faq-item";

    const btn = document.createElement("button");
    btn.className = "faq-q";
    btn.type = "button";
    btn.id = `faq-q-${i}`;
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", `faq-a-${i}`);
    btn.innerHTML = `<span></span><span class="faq-q__icon" aria-hidden="true">+</span>`;
    btn.firstChild.textContent = item.q;

    const answer = document.createElement("div");
    answer.className = "faq-a";
    answer.id = `faq-a-${i}`;
    answer.setAttribute("role", "region");
    answer.setAttribute("aria-labelledby", btn.id);
    const inner = document.createElement("div");
    const p = document.createElement("p");
    p.textContent = item.a;
    inner.appendChild(p);
    answer.appendChild(inner);

    btn.addEventListener("click", () => {
      const open = wrap.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
    });

    wrap.append(btn, answer);
    faqList.appendChild(wrap);
    return { el: wrap, data: item, text: normalize(item.q + " " + item.a) };
  });

  function renderFaq() {
    const terms = normalize(faqSearch.value.trim()).split(/\s+/).filter(Boolean);
    let visible = 0;
    faqItems.forEach(({ el, data, text }) => {
      const matchCat = activeCat === "all" || data.c === activeCat;
      const matchText = terms.every((t) => text.includes(t));
      const show = matchCat && matchText;
      el.hidden = !show;
      if (show) visible++;
    });
    faqEmpty.hidden = visible > 0;
  }

  faqSearch.addEventListener("input", renderFaq);
  renderFaq();

  /* ---------- Formulario de contacto ---------- */
  const form = document.getElementById("contactForm");
  const formError = document.getElementById("formError");
  const formSuccess = document.getElementById("formSuccess");

  const isValid = (field) => {
    if (field.type === "checkbox") return field.checked;
    const v = field.value.trim();
    if (!v) return false;
    if (field.type === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    if (field.type === "tel") return v.replace(/\D/g, "").length >= 9;
    return true;
  };

  form.querySelectorAll("input, textarea").forEach((field) => {
    const clear = () => {
      if (isValid(field)) field.classList.remove("is-invalid");
    };
    field.addEventListener("input", clear);
    field.addEventListener("change", clear);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fields = [...form.querySelectorAll("[required]")];
    let ok = true;
    fields.forEach((f) => {
      const valid = isValid(f);
      f.classList.toggle("is-invalid", !valid);
      if (!valid) ok = false;
    });
    formError.hidden = ok;
    if (!ok) {
      fields.find((f) => f.classList.contains("is-invalid"))?.focus();
      return;
    }

    /*
      IMPORTANTE: esta web es estática, así que el mensaje todavía no se envía a ningún sitio.
      Para recibirlo por email, conecta el formulario a un servicio como Formspree o Netlify Forms
      (por ejemplo: fetch("https://formspree.io/f/TU_ID", { method: "POST", body: new FormData(form),
      headers: { Accept: "application/json" } })) y muestra el mensaje de éxito cuando responda.
    */
    form.hidden = true;
    formSuccess.hidden = false;
    formSuccess.scrollIntoView({ behavior: "smooth", block: "center" });
  });
});
