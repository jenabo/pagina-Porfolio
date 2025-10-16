const STORAGE_KEY = "enekoProjects";
const ADMIN_PIN = "1234";
const LATEST_LIMIT = 3;
const CAROUSEL_INTERVAL = 6000;

const adminPanel = document.getElementById("adminPanel");
const adminAccess = document.getElementById("adminAccess");
const adminForm = document.getElementById("adminForm");
const adminPass = document.getElementById("adminPass");
const adminLogin = document.getElementById("adminLogin");
const adminLogout = document.getElementById("adminLogout");
const adminProjectList = document.getElementById("adminProjectList");

const portfolioGrid = document.getElementById("portfolioGrid");
const portfolioFilters = document.getElementById("portfolioFilters");
const portfolioFilterButtons = portfolioFilters
  ? Array.from(portfolioFilters.querySelectorAll(".filter-btn"))
  : [];

const latestCarousel = document.getElementById("latestCarousel");
const latestPrev = document.getElementById("latestPrev");
const latestNext = document.getElementById("latestNext");
const latestDots = document.getElementById("latestDots");
const latestFilters = document.getElementById("latestFilters");
const latestFilterButtons = latestFilters
  ? Array.from(latestFilters.querySelectorAll(".filter-btn"))
  : [];
const latestCard = document.getElementById("latestCard");
const latestCategory = document.getElementById("latestCategory");
const latestTitle = document.getElementById("latestTitle");
const latestDescription = document.getElementById("latestDescription");
const latestDate = document.getElementById("latestDate");
const latestTags = document.getElementById("latestTags");
const latestLink = document.getElementById("latestLink");
const latestDetailBtn = document.getElementById("latestDetail");
const latestMedia = document.getElementById("latestMedia");
const latestEmpty = document.getElementById("latestEmpty");

const projectModal = document.getElementById("projectModal");
const modalClose = document.getElementById("modalClose");
const modalMedia = document.getElementById("modalMedia");
const modalCategory = document.getElementById("modalCategory");
const modalTitle = document.getElementById("modalTitle");
const modalDescription = document.getElementById("modalDescription");
const modalTags = document.getElementById("modalTags");
const modalLink = document.getElementById("modalLink");

const imageFilePicker = document.getElementById("imageFilePicker");
const videoFilePicker = document.getElementById("videoFilePicker");
const mediaHelpers = adminForm
  ? Array.from(adminForm.querySelectorAll(".media-helper"))
  : [];
const imageUrlInput = adminForm?.querySelector('input[name="imageUrl"]');
const videoUrlInput = adminForm?.querySelector('input[name="videoUrl"]');
const typeSelect = adminForm?.querySelector('select[name="type"]');
const categorySelect = document.getElementById("categorySelect");
const adminSubmitButton = adminForm?.querySelector('button[type="submit"]');

const toast = document.getElementById("toast");

let projects = [];
let adminMode = false;
let adminPanelVisible = false;
let portfolioFilter = "all";
let latestFilter = "all";
let latestIndex = 0;
let carouselTimer = null;
let editingProjectId = null;
let latestItems = [];

const CATEGORY_OPTIONS = {
  web: [
    { value: "Web - Negocio local", label: "Web - Negocio local" },
    { value: "Web - Servicio profesional", label: "Web - Servicio profesional" },
    { value: "Web - Tienda online", label: "Web - Tienda online" },
    { value: "Web - Institucional", label: "Web - Institucional" },
  ],
  logos: [
    { value: "Logos y branding", label: "Logos y branding" },
    { value: "Identidad para campanas", label: "Identidad para campanas" },
    { value: "Brandbook y aplicaciones", label: "Brandbook y aplicaciones" },
  ],
  programas: [
    { value: "Programas - Emprendimiento familiar", label: "Programas - Emprendimiento familiar" },
    { value: "Programas - PyME", label: "Programas - PyME" },
    { value: "Programas - Automatizacion", label: "Programas - Automatizacion" },
  ],
};

const ALLOWED_TYPES = ["web", "logos", "programas"];
const MEDIA_SIZE_LIMITS = {
  image: 3 * 1024 * 1024,
  video: 6 * 1024 * 1024,
};

const generateId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const ensureEmbedUrl = (url) => {
  if (!url) return "";
  try {
    const parsed = new URL(url.trim());
    if (parsed.hostname.includes("youtu.be")) {
      const videoId = parsed.pathname.slice(1);
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname === "/watch") {
        const videoId = parsed.searchParams.get("v");
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
      }
      if (parsed.pathname.startsWith("/embed/")) {
        return url;
      }
    }
    return url;
  } catch {
    return url;
  }
};

const inferType = (category = "") => {
  const text = category.toLowerCase();
  if (text.includes("logo") || text.includes("brand")) return "logos";
  if (text.includes("programa") || text.includes("automat") || text.includes("dashboard")) return "programas";
  return "web";
};

const normalizeTags = (tags) => {
  if (Array.isArray(tags)) {
    return tags.map((tag) => tag.trim()).filter(Boolean);
  }
  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
};

const normalizeDate = (value) => {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return new Date().toISOString();
  }
  return new Date(parsed).toISOString();
};

const normalizeProject = (project) => {
  const normalized = {
    id: project.id || generateId(),
    title: (project.title || "Proyecto sin titulo").trim(),
    category: (project.category || "").trim(),
    description: (project.description || "").trim(),
    extendedDescription: (project.extendedDescription || "").trim(),
    tags: normalizeTags(project.tags),
    previewUrl: (project.previewUrl || "").trim(),
    imageUrl: (project.imageUrl || "").trim(),
    videoUrl: ensureEmbedUrl(project.videoUrl || ""),
    caseStudyUrl: (project.caseStudyUrl || "").trim(),
    date: normalizeDate(project.date),
  };

  const candidateType = (project.type || "").trim().toLowerCase();
  normalized.type = ALLOWED_TYPES.includes(candidateType)
    ? candidateType
    : inferType(normalized.category || normalized.title);

  if (!normalized.category) {
    normalized.category =
      normalized.type === "web"
        ? "Web"
        : normalized.type === "logos"
        ? "Logos y branding"
        : "Programas y automatizacion";
  }

  return normalized;
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });

const formatBytesToMB = (bytes) => (bytes / (1024 * 1024)).toFixed(1);

const processMediaFile = async (type, file) => {
  const limit = MEDIA_SIZE_LIMITS[type];
  if (!limit) return;

  if (file.size > limit) {
    showToast(
      `El archivo de ${type === "image" ? "imagen" : "video"} pesa ${formatBytesToMB(
        file.size,
      )} MB. Reducilo o usa un enlace externo.`,
    );
    return;
  }

  try {
    const dataUrl = await readFileAsDataUrl(file);
    if (type === "image" && imageUrlInput) {
      imageUrlInput.value = dataUrl;
      showToast("Imagen cargada en el formulario");
    }
    if (type === "video" && videoUrlInput) {
      videoUrlInput.value = dataUrl;
      showToast("Video cargado en el formulario");
    }
  } catch (error) {
    console.error(error);
    showToast("Hubo un problema al procesar el archivo");
  }
};

const seedProjects = () => [
  normalizeProject({
    id: generateId(),
    type: "web",
    title: "Landing para Kiosco Punto Norte",
    category: "Web - Negocio local",
    description:
      "Pagina simple con menu actualizado, promos del dia y boton directo a WhatsApp para pedidos.",
    extendedDescription:
      "Charlamos con las duenas del kiosco para entender que necesitaban mostrar y que preguntas se repetian. Armamos una landing liviana con productos clave, promos rotativas y un formulario que llega al correo y al celular.",
    tags: ["One Page", "Responsive", "WhatsApp"],
    previewUrl: "https://www.awwwards.com",
    imageUrl:
      "https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?auto=format&fit=crop&w=1400&q=80",
    date: "2024-03-22T10:15:00.000Z",
  }),
  normalizeProject({
    id: generateId(),
    type: "programas",
    title: "Mini sistema de pedidos Pastas Lola",
    category: "Programas - Emprendimiento familiar",
    description:
      "App web sencilla para cargar pedidos, calcular tiempos de entrega y avisar cuando estan listos.",
    extendedDescription:
      "El objetivo era dejar de depender del cuaderno. Hicimos pantallas grandes para usar desde una tablet y sumamos un tablero con el estado de cada pedido. Incluye recordatorios por WhatsApp y un historico exportable.",
    tags: ["Web App", "Automatizacion", "Notificaciones"],
    previewUrl: "https://github.com",
    videoUrl: "https://www.youtube.com/watch?v=2wEAo-lC_8I",
    imageUrl:
      "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1200&q=80",
    date: "2024-03-12T09:00:00.000Z",
  }),
  normalizeProject({
    id: generateId(),
    type: "logos",
    title: "Logo y grafica Escuela Horizonte",
    category: "Logos y branding",
    description:
      "Redisenamos el escudo, la tipografia y la carteleria para modernizar la imagen de la escuela.",
    extendedDescription:
      "Trabajamos con directivos y estudiantes para elegir colores y simbolos que representen la historia del colegio. Entregamos logo adaptable, plantillas para comunicados y carteles para las aulas.",
    tags: ["Identidad visual", "Carteleria", "Guia de uso"],
    previewUrl: "https://www.behance.net",
    imageUrl:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80",
    date: "2024-02-18T13:20:00.000Z",
  }),
  normalizeProject({
    id: generateId(),
    type: "web",
    title: "Sitio actualizado Estudio Contable Rivera",
    category: "Web - Servicio profesional",
    description:
      "Redisenamos la web con secciones claras, agenda de turnos y recursos para clientes nuevos.",
    extendedDescription:
      "Organizamos la informacion para que cualquier persona entienda que hace el estudio y por donde empezar. Integramos un calendario para coordinar reuniones y un area privada con descargables.",
    tags: ["Multiseccion", "Calendario", "CMS"],
    previewUrl: "https://dribbble.com",
    imageUrl:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
    date: "2024-01-28T18:40:00.000Z",
  }),
];

const loadProjects = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    projects = seedProjects();
    saveProjects();
    return;
  }

  try {
    const parsed = JSON.parse(stored);
    projects = Array.isArray(parsed)
      ? parsed.map((item) => normalizeProject(item))
      : seedProjects();
  } catch (error) {
    console.error("No se pudieron leer los proyectos guardados", error);
    projects = seedProjects();
    saveProjects();
  }
};

const saveProjects = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  renderProjects();
  renderLatest();
  renderAdminList();
};

const formatDate = (iso) => {
  const date = new Date(iso);
  return date.toLocaleDateString("es-AR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatExtendedDescription = (text) => {
  if (!text) return "";
  return text
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.trim()}</p>`)
    .join("");
};

const projectActionsMarkup = (project) => {
  const actions = [];

  if (project.previewUrl) {
    const label =
      project.type === "web"
        ? "Visitar sitio"
        : project.type === "logos"
        ? "Ver brandbook"
        : "Abrir recurso";
    actions.push(
      `<a class="btn primary small" href="${project.previewUrl}" target="_blank" rel="noopener">${label}</a>`,
    );
  }

  if (project.type === "programas" && project.videoUrl) {
    actions.push(
      `<button class="btn primary small project-action" data-action="demo" data-id="${project.id}">Ver demo</button>`,
    );
  }

  const hasDetail =
    project.extendedDescription ||
    project.videoUrl ||
    (project.type === "logos" && project.imageUrl);

  if (hasDetail) {
    actions.push(
      `<button class="btn ghost small project-action" data-action="detail" data-id="${project.id}">Ver detalles</button>`,
    );
  }

  if (project.caseStudyUrl) {
    actions.push(
      `<a class="btn ghost small" href="${project.caseStudyUrl}" target="_blank" rel="noopener">Ver documento</a>`,
    );
  }

  return actions.length
    ? `<div class="project-actions">${actions.join("")}</div>`
    : "";
};

const syncFilterButtons = (buttons, activeValue) => {
  buttons.forEach((button) => {
    const isActive = button.dataset.filter === activeValue;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", isActive ? "true" : "false");
    button.setAttribute("tabindex", isActive ? "0" : "-1");
  });
};

const renderProjects = () => {
  if (!portfolioGrid) return;

  syncFilterButtons(portfolioFilterButtons, portfolioFilter);

  const filtered = [...projects]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .filter(
      (project) => portfolioFilter === "all" || project.type === portfolioFilter,
    );

  if (!filtered.length) {
    portfolioGrid.innerHTML =
      '<div class="portfolio-empty">Todavia no se ha cargado ningun proyecto para mostrar.</div>';
    return;
  }

  const markup = filtered
    .map((project) => {
      const cover = project.imageUrl
        ? `<div class="project-cover">
            <img src="${project.imageUrl}" alt="${project.title}" loading="lazy" />
          </div>`
        : "";

      const tags =
        project.tags.length > 0
          ? `<div class="tags">${project.tags
              .map((tag) => `<span>${tag}</span>`)
              .join("")}</div>`
          : "";

      return `<article class="project-card project-${project.type}" data-id="${project.id}" data-type="${project.type}">
        ${cover}
        <div class="project-meta">
          <span>${project.category}</span>
          <span>${formatDate(project.date)}</span>
        </div>
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        ${tags}
        ${projectActionsMarkup(project)}
      </article>`;
    })
    .join("");

  portfolioGrid.innerHTML = markup;
};

const renderLatestMedia = (project) => {
  const hasVideo = Boolean(project.videoUrl);
  const isDirectVideo =
    hasVideo &&
    (project.videoUrl.startsWith("data:") ||
      /\.mp4($|\?)/i.test(project.videoUrl));

  const shouldShowVideo =
    hasVideo && (!project.imageUrl || project.type === "programas");

  if (shouldShowVideo) {
    return isDirectVideo
      ? `<video controls playsinline src="${project.videoUrl}"></video>`
      : `<iframe src="${project.videoUrl}" title="${project.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
  }

  if (project.imageUrl) {
    return `<img src="${project.imageUrl}" alt="${project.title}" loading="lazy" />`;
  }

  return '<div class="project-cover placeholder"></div>';
};

const updateLatestDots = () => {
  if (!latestDots) return;
  latestDots.innerHTML = latestItems
    .map(
      (_, index) =>
        `<button type="button" class="latest-dot${
          index === latestIndex ? " active" : ""
        }" data-index="${index}" aria-label="Ir al proyecto ${index + 1}"></button>`,
    )
    .join("");
};

const showLatest = (index) => {
  if (!latestItems.length || !latestCard) return;
  latestIndex = (index + latestItems.length) % latestItems.length;
  const project = latestItems[latestIndex];

  latestCategory.textContent = project.category;
  latestTitle.textContent = project.title;
  latestDescription.textContent = project.description;
  latestDate.textContent = formatDate(project.date);

  latestTags.innerHTML = project.tags.map((tag) => `<span>${tag}</span>`).join("");

  const projectLink = project.previewUrl || project.caseStudyUrl;
  if (projectLink) {
    latestLink.href = projectLink;
    latestLink.style.display = "inline-flex";
  } else {
    latestLink.style.display = "none";
  }

  const hasDetail =
    project.extendedDescription || project.videoUrl || project.imageUrl;
  if (hasDetail) {
    latestDetailBtn.dataset.id = project.id;
    latestDetailBtn.style.display = "inline-flex";
  } else {
    latestDetailBtn.style.display = "none";
    delete latestDetailBtn.dataset.id;
  }

  latestMedia.innerHTML = renderLatestMedia(project);

  updateLatestDots();
  Array.from(latestDots.children).forEach((dot, dotIndex) => {
    dot.classList.toggle("active", dotIndex === latestIndex);
  });
};

const startCarouselAutoplay = () => {
  clearInterval(carouselTimer);
  if (latestItems.length <= 1) return;
  carouselTimer = setInterval(() => {
    showLatest(latestIndex + 1);
  }, CAROUSEL_INTERVAL);
};

const renderLatest = () => {
  if (!latestCarousel || !latestCard || !latestDots) return;

  syncFilterButtons(latestFilterButtons, latestFilter);

  latestItems = [...projects]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .filter((project) => latestFilter === "all" || project.type === latestFilter)
    .slice(0, LATEST_LIMIT);

  if (!latestItems.length) {
    latestCarousel.style.display = "none";
    latestDots.innerHTML = "";
    latestDots.style.display = "none";
    if (latestEmpty) latestEmpty.style.display = "block";
    clearInterval(carouselTimer);
    carouselTimer = null;
    return;
  }

  latestCarousel.style.display = "";
  if (latestEmpty) latestEmpty.style.display = "none";

  latestIndex = Math.min(latestIndex, latestItems.length - 1);
  updateLatestDots();
  latestDots.style.display = latestItems.length > 1 ? "flex" : "none";
  showLatest(latestIndex);
  startCarouselAutoplay();

  const controlsVisible = latestItems.length > 1;
  if (latestPrev && latestNext) {
    latestPrev.style.display = controlsVisible ? "grid" : "none";
    latestNext.style.display = controlsVisible ? "grid" : "none";
  }
};

const renderAdminList = () => {
  if (!adminProjectList) return;

  adminProjectList.innerHTML = "";

  if (!projects.length) {
    const empty = document.createElement("li");
    empty.className = "admin-empty";
    empty.textContent = "Todavia no cargaste proyectos.";
    adminProjectList.appendChild(empty);
    return;
  }

  projects
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((project) => {
      const item = document.createElement("li");
      item.className = `admin-project-item${project.id === editingProjectId ? " editing" : ""}`;
      item.innerHTML = `
        <span>${project.title}<span class="admin-project-type">[${project.type}]</span></span>
        <div class="admin-actions">
          <button data-action="edit" data-id="${project.id}">Editar</button>
          <button data-action="highlight" data-id="${project.id}">Marcar como nuevo</button>
          <button data-action="delete" data-id="${project.id}">Eliminar</button>
        </div>
      `;
      adminProjectList.appendChild(item);
    });
};

const showToast = (message) => {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("visible");
  setTimeout(() => {
    toast.classList.remove("visible");
  }, 3200);
};

document.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

document.addEventListener("dragstart", (event) => {
  event.preventDefault();
});

document.addEventListener("copy", (event) => {
  event.preventDefault();
  showToast("Accion deshabilitada");
});

const updateAdminUI = () => {
  if (!adminAccess || !adminForm || !adminLogout || !adminProjectList) return;

  adminAccess.style.display = adminMode ? "none" : "flex";
  adminForm.style.display = adminMode ? "block" : "none";
  adminLogout.style.display = adminMode ? "inline-flex" : "none";
  adminProjectList.parentElement.style.display = adminMode ? "block" : "none";
};

const resetAdminForm = () => {
  if (!adminForm) return;
  adminForm.reset();
  editingProjectId = null;
  const fallbackType = typeSelect?.value || "web";
  populateCategoryOptions(fallbackType);
  if (categorySelect) categorySelect.selectedIndex = 0;
  categorySelect?.setAttribute("aria-invalid", "false");
  if (adminSubmitButton) adminSubmitButton.textContent = "Guardar proyecto";
  renderAdminList();
};

const startEditProject = (project) => {
  if (!adminForm) return;
  if (!adminPanelVisible) toggleAdminPanel(true);
  if (!adminMode) toggleAdminMode(true);

  editingProjectId = project.id;

  if (typeSelect) {
    typeSelect.value = project.type;
    populateCategoryOptions(project.type, project.category);
  }

  if (categorySelect) {
    categorySelect.value = project.category;
    categorySelect.setAttribute("aria-invalid", "false");
  }

  adminForm.elements.title.value = project.title;
  adminForm.elements.description.value = project.description;
  adminForm.elements.tags.value = project.tags.join(", ");
  adminForm.elements.previewUrl.value = project.previewUrl || "";
  adminForm.elements.imageUrl.value = project.imageUrl || "";
  adminForm.elements.videoUrl.value = project.videoUrl || "";
  adminForm.elements.caseStudyUrl.value = project.caseStudyUrl || "";
  adminForm.elements.extendedDescription.value = project.extendedDescription || "";

  if (adminSubmitButton) {
    adminSubmitButton.textContent = "Actualizar proyecto";
  }

  renderAdminList();
  adminForm.scrollIntoView({ behavior: "smooth", block: "start" });
  adminForm.elements.title.focus();
  showToast("Editando proyecto");
};

const toggleAdminMode = (value) => {
  adminMode = value;
  updateAdminUI();

  if (value) {
    showToast("Modo admin activado");
    resetAdminForm();
  } else {
    showToast("Modo admin cerrado");
    resetAdminForm();
    if (adminPass) adminPass.value = "";
  }
};

const toggleAdminPanel = (force) => {
  if (!adminPanel) return;
  const nextState =
    typeof force === "boolean" ? force : !adminPanelVisible;

  adminPanelVisible = nextState;
  adminPanel.classList.toggle("visible", nextState);
  adminPanel.setAttribute("aria-hidden", nextState ? "false" : "true");

  if (nextState) {
    updateAdminUI();
    setTimeout(() => {
      if (!adminMode) {
        adminPass?.focus();
      }
    }, 120);
  }
};

const processMediaHelpers = () => {
  mediaHelpers.forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.type;
      if (type === "image") imageFilePicker?.click();
      if (type === "video") videoFilePicker?.click();
    });
  });

  imageFilePicker?.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processMediaFile("image", file);
    event.target.value = "";
  });

  videoFilePicker?.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processMediaFile("video", file);
    event.target.value = "";
  });

  adminForm?.addEventListener("paste", async (event) => {
    const items = event.clipboardData?.items;
    if (!items) return;
    const imageItem = Array.from(items).find((item) => item.type.startsWith("image/"));
    if (!imageItem) return;
    const file = imageItem.getAsFile();
    if (!file) return;
    event.preventDefault();
    await processMediaFile("image", file);
  });
};

const populateCategoryOptions = (type, selectedValue = "") => {
  if (!categorySelect) return;
  const baseOptions = CATEGORY_OPTIONS[type] ? [...CATEGORY_OPTIONS[type]] : [];
  const hasSelectedInBase = selectedValue
    ? baseOptions.some((option) => option.value === selectedValue)
    : false;

  if (selectedValue && !hasSelectedInBase) {
    baseOptions.push({ value: selectedValue, label: selectedValue });
  }

  const placeholderSelected = selectedValue ? "" : " selected";
  let template = `<option value="" disabled${placeholderSelected}>Selecciona una categoria</option>`;
  template += baseOptions
    .map(
      (option) =>
        `<option value="${option.value}"${
          option.value === selectedValue ? " selected" : ""
        }>${option.label}</option>`,
    )
    .join("");
  categorySelect.innerHTML = template;

  if (selectedValue) {
    categorySelect.value = selectedValue;
  }
};

const handleProjectActionClick = (event) => {
  const button = event.target.closest(".project-action");
  if (!button) return;

  const { action, id } = button.dataset;
  if (!action || !id) return;

  if (action === "demo") {
    openProjectModal(id, "demo");
  }

  if (action === "detail") {
    openProjectModal(id, "detail");
  }
};

const openProjectModal = (id, mode = "detail") => {
  if (!projectModal) return;
  const project = projects.find((item) => item.id === id);
  if (!project) return;

  const hasVideo = Boolean(project.videoUrl);
  const showVideo =
    (mode === "demo" && hasVideo) || (!project.imageUrl && hasVideo);
  const isDirectVideo =
    hasVideo &&
    (project.videoUrl.startsWith("data:") ||
      /\.mp4($|\?)/i.test(project.videoUrl));

  let mediaContent;
  if (showVideo) {
    mediaContent = isDirectVideo
      ? `<video controls playsinline src="${project.videoUrl}"></video>`
      : `<iframe src="${project.videoUrl}" title="${project.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
  } else if (project.imageUrl) {
    mediaContent = `<img src="${project.imageUrl}" alt="${project.title}" />`;
  } else {
    mediaContent = '<div class="project-cover placeholder"></div>';
  }

  modalMedia.innerHTML = mediaContent;
  modalCategory.textContent = project.category;
  modalTitle.textContent = project.title;
  modalDescription.innerHTML =
    formatExtendedDescription(project.extendedDescription) ||
    `<p>${project.description}</p>`;
  modalTags.innerHTML = project.tags.map((tag) => `<span>${tag}</span>`).join("");

  const externalLink = project.caseStudyUrl || project.previewUrl;
  if (externalLink) {
    modalLink.href = externalLink;
    modalLink.style.display = "inline-flex";
  } else {
    modalLink.style.display = "none";
  }

  projectModal.classList.add("visible");
  projectModal.setAttribute("aria-hidden", "false");
};

const closeProjectModal = () => {
  if (!projectModal) return;
  projectModal.classList.remove("visible");
  projectModal.setAttribute("aria-hidden", "true");
  modalMedia.innerHTML = "";
};

const handleAdminFormSubmit = (event) => {
  event.preventDefault();
  if (!adminMode) {
    showToast("Necesitas activar el modo admin");
    return;
  }

  const formData = new FormData(adminForm);
  const title = formData.get("title")?.trim();
  const category = formData.get("category");
  const description = formData.get("description")?.trim();

  if (!title || !category || !description) {
    categorySelect?.setAttribute("aria-invalid", "true");
    showToast("Completa titulo, categoria y descripcion");
    return;
  }

  categorySelect?.setAttribute("aria-invalid", "false");

  const baseProject = editingProjectId
    ? projects.find((project) => project.id === editingProjectId)
    : null;

  const rawProject = {
    id: baseProject?.id ?? generateId(),
    type: formData.get("type"),
    title,
    category,
    description,
    tags: formData.get("tags"),
    previewUrl: formData.get("previewUrl"),
    imageUrl: formData.get("imageUrl"),
    videoUrl: formData.get("videoUrl"),
    caseStudyUrl: formData.get("caseStudyUrl"),
    extendedDescription: formData.get("extendedDescription"),
    date: baseProject?.date ?? new Date().toISOString(),
  };

  const project = normalizeProject(rawProject);

  if (baseProject) {
    const index = projects.findIndex((item) => item.id === baseProject.id);
    if (index !== -1) {
      projects[index] = project;
      showToast("Proyecto actualizado");
    }
  } else {
    projects.push(project);
    showToast("Proyecto guardado correctamente");
  }

  saveProjects();
  resetAdminForm();
};

const handleAdminListClick = (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const action = target.dataset.action;
  const id = target.dataset.id;
  if (!action || !id) return;

  const index = projects.findIndex((project) => project.id === id);
  if (index === -1) return;

  if (action === "edit") {
    startEditProject(projects[index]);
    return;
  }

  if (action === "delete") {
    if (projects[index].id === editingProjectId) {
      resetAdminForm();
    }
    projects.splice(index, 1);
    saveProjects();
    showToast("Proyecto eliminado");
  }

  if (action === "highlight") {
    projects[index].date = new Date().toISOString();
    saveProjects();
    showToast("Proyecto marcado como nuevo");
  }
};

typeSelect?.addEventListener("change", () => {
  const nextType = typeSelect.value;
  populateCategoryOptions(nextType);
  categorySelect?.setAttribute("aria-invalid", "false");
});

processMediaHelpers();

adminLogin?.addEventListener("click", () => {
  if (adminPass?.value === ADMIN_PIN) {
    toggleAdminMode(true);
  } else {
    showToast("PIN incorrecto");
  }
});

adminLogout?.addEventListener("click", () => {
  toggleAdminMode(false);
});

adminForm?.addEventListener("submit", handleAdminFormSubmit);
adminProjectList?.addEventListener("click", handleAdminListClick);

portfolioGrid?.addEventListener("click", handleProjectActionClick);

portfolioFilters?.addEventListener("click", (event) => {
  const button = event.target.closest(".filter-btn");
  if (!button) return;
  const filter = button.dataset.filter;
  if (!filter) return;
  portfolioFilter = filter;
  renderProjects();
});

latestFilters?.addEventListener("click", (event) => {
  const button = event.target.closest(".filter-btn");
  if (!button) return;
  const filter = button.dataset.filter;
  if (!filter) return;
  latestFilter = filter;
  renderLatest();
});

latestPrev?.addEventListener("click", () => {
  showLatest(latestIndex - 1);
  startCarouselAutoplay();
});

latestNext?.addEventListener("click", () => {
  showLatest(latestIndex + 1);
  startCarouselAutoplay();
});

latestDots?.addEventListener("click", (event) => {
  const dot = event.target.closest(".latest-dot");
  if (!dot) return;
  const index = Number.parseInt(dot.dataset.index, 10);
  if (Number.isNaN(index)) return;
  showLatest(index);
  startCarouselAutoplay();
});

latestDetailBtn?.addEventListener("click", () => {
  const id = latestDetailBtn.dataset.id;
  if (!id) return;
  openProjectModal(id, "detail");
});

projectModal?.addEventListener("click", (event) => {
  if (event.target === projectModal) {
    closeProjectModal();
  }
});

modalClose?.addEventListener("click", closeProjectModal);

document.addEventListener("keydown", (event) => {
  const key = typeof event.key === "string" ? event.key.toLowerCase() : "";
  const tagName = event.target && "tagName" in event.target ? event.target.tagName.toLowerCase() : "";
  const isTypingContext =
    tagName === "input" || tagName === "textarea" || tagName === "select" || event.target?.isContentEditable;

  const ctrlOrCmd = event.ctrlKey || event.metaKey;
  const blockedShortcut =
    key === "f12" ||
    (ctrlOrCmd && event.shiftKey && (key === "i" || key === "j" || key === "c")) ||
    (ctrlOrCmd && (key === "u" || key === "s" || key === "p"));

  if (blockedShortcut) {
    event.preventDefault();
    showToast("Atajo deshabilitado");
    return;
  }

  if (event.shiftKey && key === "o" && !isTypingContext) {
    event.preventDefault();
    toggleAdminPanel();
  }

  if (key === "escape") {
    if (projectModal?.classList.contains("visible")) {
      closeProjectModal();
    } else if (adminPanelVisible) {
      toggleAdminPanel(false);
    }
  }
});

window.addEventListener("focus", () => {
  startCarouselAutoplay();
});

window.addEventListener("blur", () => {
  clearInterval(carouselTimer);
});

document.addEventListener("DOMContentLoaded", () => {
  loadProjects();
  renderProjects();
  renderLatest();
  renderAdminList();
  populateCategoryOptions(typeSelect?.value || "web");
  updateAdminUI();
  toggleAdminPanel(false);

  const year = document.getElementById("year");
  if (year) {
    year.textContent = new Date().getFullYear().toString();
  }
});
