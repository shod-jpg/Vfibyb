const sortingBlock = document.getElementById('sorting-block');
const sortOptions = document.getElementById('sort-options');
const selectionBlock = document.getElementById('selection-block');
const carsList = document.getElementById('cars-list');
const brandBlock = document.getElementById('brand-block');
const modelBlock = document.getElementById('model-block');
const yearBlock = document.getElementById('year-block');

let carsData = [];

// Завантаження JSON-даних
async function loadJsonData() {
  try {
    const response = await fetch('../sample.json');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return processJsonData(data);
  } catch (error) {
    console.error('Помилка завантаження JSON:', error);
    return [];
  }
}

// Обробка JSON-даних
function processJsonData(data) {
  const result = [];
  Object.keys(data).forEach(key => {
    const [brand, model, year] = key.split('/');
    const imageUrl = data[key];
    let carEntry = result.find(car => car.brand === brand && car.model === model && car.year === year);
    if (!carEntry) {
      carEntry = { brand, model, year, images: [] };
      result.push(carEntry);
    }
    if (imageUrl) {
      carEntry.images.push(imageUrl); // Додаємо тільки якщо є зображення
    }
  });
  return result.filter(car => car.images.length > 0); // Фільтруємо авто без зображень
}

// Відображення автомобілів
function renderCars(cars) {
  carsList.innerHTML = '';
  cars
    .filter(car => car.images.length > 0) // Фільтруємо авто без зображень
    .forEach(car => {
      const card = document.createElement('div');
      card.className = 'car-card';
      const validImages = car.images.filter(image => {
        const img = new Image();
        img.src = image;
        return img.width > 1 && img.height > 1; // Перевіряємо, чи зображення не 1x1 піксель
      });

      if (validImages.length > 0) {
        card.innerHTML = `
          <p><strong>${car.brand}</strong> ${car.model}</p>
          <p>Рік: ${car.year}</p>
          <div class="car-images">
            ${validImages.map(image => `<img src="${image}" alt="${car.brand} ${car.model}" class="car-thumbnail">`).join('')}
          </div>
        `;
        carsList.appendChild(card);
      }
    });

  // Додаємо обробник подій для відкриття зображення на весь екран
  document.querySelectorAll('.car-thumbnail').forEach(img => {
    img.addEventListener('click', event => {
      showFullScreenImage(event.target.src);
    });
  });

  carsList.classList.remove('hidden');
}

// Показати зображення на весь екран
function showFullScreenImage(imageSrc) {
  const overlay = document.createElement('div');
  overlay.id = 'image-overlay';
  overlay.innerHTML = `
    <div class="image-container">
      <img src="${imageSrc}" alt="Full Screen Image">
      <button id="close-overlay">✖</button>
    </div>
  `;
  document.body.appendChild(overlay);

  // Закриття зображення
  document.getElementById('close-overlay').addEventListener('click', () => {
    document.body.removeChild(overlay);
  });
}

// Сортування автомобілів
function sortCars(criteria) {
  const sorted = [...carsData];
  if (criteria === 'alphabet') {
    sorted.sort((a, b) => a.brand.localeCompare(b.brand)); // Сортування за алфавітом (марка)
  } else if (criteria === 'model') {
    sorted.sort((a, b) => a.model.localeCompare(b.model)); // Сортування за моделлю
  } else if (criteria === 'date') {
    sorted.sort((a, b) => a.year - b.year); // Сортування за датою випуску
  }
  renderCars(sorted);
}

// Вибір авто
function selectCar() {
  brandBlock.innerHTML = '';
  modelBlock.innerHTML = '';
  yearBlock.innerHTML = '';
  const brands = [...new Set(carsData.map(car => car.brand))];
  brands.forEach(brand => {
    const button = document.createElement('button');
    button.textContent = brand;
    button.addEventListener('click', () => {
      modelBlock.innerHTML = '';
      yearBlock.innerHTML = '';
      const models = [...new Set(carsData.filter(car => car.brand === brand).map(car => car.model))];
      models.forEach(model => {
        const modelButton = document.createElement('button');
        modelButton.textContent = model;
        modelButton.addEventListener('click', () => {
          yearBlock.innerHTML = '';
          const years = [...new Set(carsData.filter(car => car.brand === brand && car.model === model).map(car => car.year))];
          years.forEach(year => {
            const yearButton = document.createElement('button');
            yearButton.textContent = year;
            yearButton.addEventListener('click', () => {
              const filteredCars = carsData.filter(car => car.brand === brand && car.model === model && car.year === year);
              renderCars(filteredCars);
            });
            yearBlock.appendChild(yearButton);
          });
        });
        modelBlock.appendChild(modelButton);
      });
    });
    brandBlock.appendChild(button);
  });
  selectionBlock.classList.remove('hidden');
}

// Slot machine logic
function startSlotMachine(slotId) {
  const slot = document.getElementById(slotId);
  const containers = slot.querySelectorAll('.slot-container');
  const results = ['🍒', '🍋', '⭐']; // Symbols for the slot machine
  const intervals = [];

  containers.forEach(container => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * results.length);
      container.textContent = results[randomIndex];
    }, 100);
    intervals.push(interval);
  });

  setTimeout(() => {
    intervals.forEach(interval => clearInterval(interval));
    const symbols = Array.from(containers).map(container => container.textContent);
    const isWin = symbols.every(symbol => symbol === symbols[0]); // Check if all symbols match
    if (isWin) {
      showWinningImage();
    }
  }, 3000); // Run for 3 seconds
}

// Display a random winning image or error
function showWinningImage() {
  const overlay = document.createElement('div');
  overlay.id = 'overlay';
  document.body.appendChild(overlay);
  overlay.style.display = 'block';

  const winDisplay = document.createElement('div');
  winDisplay.id = 'win-display';

  const randomCar = carsData[Math.floor(Math.random() * carsData.length)];
  const randomImage = randomCar.images[0];

  const img = new Image();
  img.src = randomImage;
  img.onload = () => {
    if (img.width === 1 && img.height === 1) {
      winDisplay.innerHTML = `<p>Error 404: Try Again!</p>`;
    } else {
      winDisplay.innerHTML = `<img src="${randomImage}" alt="Winning Car">`;
    }
    document.body.appendChild(winDisplay);
    winDisplay.style.display = 'block';

    setTimeout(() => {
      winDisplay.style.display = 'none';
      overlay.style.display = 'none';
      document.body.removeChild(winDisplay);
      document.body.removeChild(overlay);
    }, 4000 + Math.random() * 3000); // Display for 4-7 seconds
  };
}

// Initialize slot machines
function initSlotMachines() {
  document.querySelectorAll('.slot-run').forEach(button => {
    button.addEventListener('click', () => startSlotMachine(button.dataset.slot));
  });
}

// Ініціалізація
async function init() {
  carsData = await loadJsonData();
  initSlotMachines(); // Initialize slot machines

  document.getElementById('sort-all').addEventListener('click', () => {
    sortOptions.classList.toggle('hidden');
    selectionBlock.classList.add('hidden');
    carsList.classList.add('hidden');
  });

  document.getElementById('select-car').addEventListener('click', () => {
    sortOptions.classList.add('hidden');
    carsList.classList.add('hidden');
    selectCar();
  });

  sortOptions.addEventListener('click', event => {
    if (event.target.tagName === 'BUTTON') {
      sortCars(event.target.dataset.sort); // Виклик сортування за вибраним критерієм
      sortOptions.classList.add('hidden');
    }
  });
}

init();
