let cardsData = [
  {
    id: "1",
    title: "Long Walk to Freedom",
    author: "Nelson Mandela",
    date: "1994",
    type: "Biography",
    tags: ["History"],
    available: true,
    quote: "I have discovered the secret that after climbing a great hill, one only finds that there are many more hills to climb. I have taken a moment here to rest, to steal a view of the glorious vista that surrounds me, to look back on the distance I have come. But I can only rest for a moment, for with freedom come responsibilities, and I dare not linger, for my long walk is not ended.",
    totalPages: 1243,
    readPages: 1243
  },
  {
    id: "2",
    title: "The Autobiography of Benjamin Franklin",
    author: "Benjamin Franklin",
    date: "1706",
    type: "Biography",
    tags: ["History"],
    available: true,
    quote: "hello",
    totalPages: 350,
    readPages: 100
  }
];

// DOM elements
const cardsContainer = document.getElementById('cardsContainer');
const cardForm = document.getElementById('cardForm');
const submitBtn = document.getElementById('submitBtn');

let editingCardId = null;

// Calculate completion percentage (clamped 0–100)
function calculateCompletion(read, total) {
  if (total <= 0) return 0;
  const percent = Math.round((read / total) * 100);
  return Math.min(Math.max(percent, 0), 100);
}

// Render all book cards
function renderCards() {
  cardsContainer.innerHTML = '';

  if (cardsData.length === 0) {
    cardsContainer.innerHTML = '<p class="empty-state">No books available. Create one below!</p>';
    return;
  }

  cardsData.forEach(card => {
    let tagsHTML = '';

    tagsHTML += card.available
      ? `<span class="tag tag-available">Available</span>`
      : `<span class="tag tag-not-available">Not Available</span>`;

    const displayedTags = card.tags.slice(0, 3);
    const remainingCount = card.tags.length - 3;

    tagsHTML += displayedTags.map(tag => `<span class="tag">${tag}</span>`).join('');

    if (remainingCount > 0) {
      tagsHTML += `<span class="tag tag-count">+${remainingCount}</span>`;
    }

    const completionPercent = calculateCompletion(card.readPages, card.totalPages);
    const completionText = completionPercent === 100 ? "Completed" : `Completion: ${completionPercent}%`;
    const quoteHTML = card.quote
      ? `<div class="quote-container" title="${card.quote.replace(/"/g, '&quot;')}">"${card.quote}"</div>`
      : '';

    const cardHTML = `
      <div class="card">
        <div class="card-header">
          <h1 class="card-title">${card.title}</h1>
          <div class="header-actions">
            <span class="badge">${card.type}</span>
          </div>
        </div>
        <hr class="divider">
        <div class="metadata">
          <p class="author-date">${card.author} &middot; ${card.date}</p>
          <div class="completion-info">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            <span class="${completionPercent === 100 ? 'percent' : ''}">${completionText}</span>
          </div>
        </div>
        ${quoteHTML}
        <div class="tags-container">${tagsHTML}</div>

        <div class="options-menu" id="menu-${card.id}">
          <button class="menu-toggle-btn" onclick="toggleMenu('${card.id}', event)">&#8942;</button>
          <div class="dropdown">
            <button class="dropdown-item" onclick="editCard('${card.id}')">Edit Book</button>
            <button class="dropdown-item delete" onclick="deleteCard('${card.id}')">Delete</button>
          </div>
        </div>
      </div>
    `;
    cardsContainer.insertAdjacentHTML('beforeend', cardHTML);
  });
}

// Toggle the options dropdown for a single card
function toggleMenu(id, event) {
  event.stopPropagation();
  const currentMenu = document.getElementById(`menu-${id}`);

  document.querySelectorAll('.options-menu').forEach(menu => {
    if (menu !== currentMenu) menu.classList.remove('active');
  });

  currentMenu.classList.toggle('active');
}

// Close all dropdowns when clicking anywhere else
document.addEventListener('click', () => {
  document.querySelectorAll('.options-menu').forEach(menu => {
    menu.classList.remove('active');
  });
});

// Fill the form with the selected card's data and enter edit mode
function editCard(id) {
  const cardToEdit = cardsData.find(c => c.id === id);
  if (!cardToEdit) return;

  document.getElementById('title').value = cardToEdit.title;
  document.getElementById('author').value = cardToEdit.author;
  document.getElementById('date').value = cardToEdit.date;
  document.getElementById('type').value = cardToEdit.type;
  document.getElementById('totalPages').value = cardToEdit.totalPages || '';
  document.getElementById('readPages').value = cardToEdit.readPages || '';
  document.getElementById('available').checked = cardToEdit.available;
  document.getElementById('tags').value = cardToEdit.tags.join(', ');
  document.getElementById('quote').value = cardToEdit.quote || '';

  editingCardId = id;
  submitBtn.textContent = 'Update Book';

  // Form is always visible; scroll to it so the user can edit
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

// Remove a card from the library
function deleteCard(id) {
  cardsData = cardsData.filter(card => card.id !== id);
  if (editingCardId === id) {
    cardForm.reset();
    editingCardId = null;
    submitBtn.textContent = 'Create Book';
  }
  renderCards();
}

// Handle form submission (create or update)
cardForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const totalPages = parseInt(document.getElementById('totalPages').value) || 0;
  const readPages = parseInt(document.getElementById('readPages').value) || 0;
  const errorSpan = document.getElementById('pagesError');
  const readPagesInput = document.getElementById('readPages');
  const tagsInput = document.getElementById('tags').value;

  // Validate page counts
  if (readPages > totalPages && totalPages > 0) {
    errorSpan.style.display = 'block';
    readPagesInput.classList.add('input-error');
    return;
  } else {
    errorSpan.style.display = 'none';
    readPagesInput.classList.remove('input-error');
  }

  const cardData = {
    title: document.getElementById('title').value,
    author: document.getElementById('author').value,
    date: document.getElementById('date').value,
    type: document.getElementById('type').value,
    tags: tagsInput.split(',').map(t => t.trim()).filter(t => t !== ''),
    available: document.getElementById('available').checked,
    quote: document.getElementById('quote').value,
    totalPages: totalPages,
    readPages: readPages
  };

  if (editingCardId) {
    // Update existing book
    const index = cardsData.findIndex(c => c.id === editingCardId);
    if (index !== -1) {
      cardsData[index] = { ...cardsData[index], ...cardData };
    }
    editingCardId = null;
    submitBtn.textContent = 'Create Book';
  } else {
    // Create new book
    cardsData.push({ id: Date.now().toString(), ...cardData });
  }

  renderCards();
  cardForm.reset();
});

// Initial render on page load
renderCards();