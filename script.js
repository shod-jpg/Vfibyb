// Завантаження JSON-даних із файлу
async function loadJsonData() {
    try {
      const response = await fetch('sample.json'); // Завантаження JSON-файлу
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const jsonData = await response.json(); // Перетворення у формат JSON
      return jsonData;
    } catch (error) {
      console.error('Помилка завантаження JSON:', error);
      return {};
    }
  }
  
  // Функція для обробки JSON-даних
  function processJsonData(data) {
    const result = [];
  
    Object.keys(data).forEach(key => {
      const [brand, model, year] = key.split('/'); // Розділяємо ключ на частини
      const imageUrl = data[key];
  
      // Знаходимо існуючий запис для марки та року
      let carEntry = result.find(car => car.brand === brand && car.year === year);
  
      if (!carEntry) {
        // Якщо запису немає, створюємо новий
        carEntry = { brand, model, year, images: [] };
        result.push(carEntry);
      }
  
      // Додаємо URL зображення, якщо воно існує
      if (imageUrl) {
        carEntry.images.push(imageUrl);
      }
    });
  
    // Фільтруємо автомобілі, у яких немає зображень
    return result.filter(car => car.images.length > 0);
  }
  
  // Елементи DOM
  const listEl = document.getElementById('cars-list');
  const sortSelect = document.getElementById('sort');
  
  // Функція для відображення автомобілів
  function renderCars(arr) {
    listEl.innerHTML = '';
    arr.forEach(car => {
      const card = document.createElement('div');
      card.className = 'car-card';
      card.innerHTML = `
        <div class="car-info">
          <strong>${car.brand}</strong> ${car.model}<br>
          <span>Рік: ${car.year}</span>
        </div>
        <div class="car-images">
          ${car.images.map(image => `<img src="${image}" alt="${car.brand} ${car.model}" class="car-image">`).join('')}
        </div>
      `;
      listEl.appendChild(card);
    });
  }
  
// Функція для сортування автомобілів
function sortCars(criteria, cars) {
    let sorted = [...cars];
    if (criteria === 'brand') {
      sorted.sort((a, b) => a.brand.localeCompare(b.brand)); // Сортування за маркою
    } else if (criteria === 'alphabet') {
      sorted.sort((a, b) => (a.brand + a.model).localeCompare(b.brand + b.model)); // Сортування за алфавітом
    } else if (criteria === 'year') {
      sorted.sort((a, b) => a.year - b.year); // Сортування за роком
    }
    renderCars(sorted); // Відображення відсортованих автомобілів
  }
  
  // Функція для створення блоку
function createCollapsibleBlock(title, items, onClick) {
  const block = document.createElement('div');
  block.className = 'collapsible-block';

  const header = document.createElement('div');
  header.className = 'collapsible-header';
  header.textContent = title;
  header.addEventListener('click', () => {
    content.style.display = content.style.display === 'none' ? 'block' : 'none';
  });

  const content = document.createElement('div');
  content.className = 'collapsible-content';
  content.style.display = 'none';

  items.forEach(item => {
    const button = document.createElement('button');
    button.className = 'collapsible-item';
    button.textContent = item;
    button.addEventListener('click', () => onClick(item));
    content.appendChild(button);
  });

  block.appendChild(header);
  block.appendChild(content);
  return block;
}

// Функція для відображення блоків
function renderBlocks(cars) {
  listEl.innerHTML = '';

  const brands = [...new Set(cars.map(car => car.brand))];
  brands.forEach(brand => {
    const filteredByBrand = cars.filter(car => car.brand === brand);
    const models = [...new Set(filteredByBrand.map(car => car.model))];

    const brandBlock = createCollapsibleBlock(brand, models, model => {
      const filteredByModel = filteredByBrand.filter(car => car.model === model);
      const years = [...new Set(filteredByModel.map(car => car.year))];

      const modelBlock = createCollapsibleBlock(model, years, year => {
        const filteredByYear = filteredByModel.filter(car => car.year === year);
        renderCars(filteredByYear);
      });

      listEl.appendChild(modelBlock);
    });

    listEl.appendChild(brandBlock);
  });
}

// Оновлена ініціалізація
async function init() {
  const jsonData = await loadJsonData(); // Завантаження JSON
  const cars = processJsonData(jsonData); // Обробка JSON

  // Відображення блоків
  renderBlocks(cars);
}

init(); // Запуск