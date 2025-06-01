export const defaultOptimizationGameData = {
  problemDescription: "Задача: Оптимизировать функцию сортировки массива чисел",
  timeSteps: 5, // Общее количество шагов оптимизации
  originalCode: `function bubbleSort(arr) {
  let len = arr.length;
  for (let i = 0; i < len; i++) {
    for (let j = 0; j < len - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Меняем элементы местами
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}`,
  player1Progress: [
    {
      code: `function bubbleSort(arr) {
  let len = arr.length;
  for (let i = 0; i < len; i++) {
    for (let j = 0; j < len - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Меняем элементы местами
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}`,
      metrics: { executionTime: 120, memoryUsage: 85, complexity: 'n^2' }
    },
    {
      code: `function bubbleSort(arr) {
  let len = arr.length;
  for (let i = 0; i < len; i++) {
    let swapped = false;
    for (let j = 0; j < len - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Меняем элементы местами
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        swapped = true;
      }
    }
    // Если не было обменов на этой итерации, массив уже отсортирован
    if (!swapped) break;
  }
  return arr;
}`,
      metrics: { executionTime: 95, memoryUsage: 85, complexity: 'n^2' }
    },
    {
      code: `function bubbleSort(arr) {
  let len = arr.length;
  let swapped;
  do {
    swapped = false;
    for (let i = 0; i < len - 1; i++) {
      if (arr[i] > arr[i + 1]) {
        // Деструктурированное присваивание для обмена значениями
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        swapped = true;
      }
    }
    len--; // Уменьшаем длину, т.к. последний элемент уже на месте
  } while (swapped);
  return arr;
}`,
      metrics: { executionTime: 80, memoryUsage: 82, complexity: 'n^2' }
    },
    {
      code: `function bubbleSort(arr) {
  // Создаем копию входного массива, чтобы не изменять исходный
  const array = [...arr];
  let len = array.length;
  let swapped;
  do {
    swapped = false;
    for (let i = 0; i < len - 1; i++) {
      if (array[i] > array[i + 1]) {
        [array[i], array[i + 1]] = [array[i + 1], array[i]];
        swapped = true;
      }
    }
    len--; // Оптимизация - последний элемент уже на месте
  } while (swapped);
  return array;
}`,
      metrics: { executionTime: 75, memoryUsage: 90, complexity: 'n^2' }
    },
    {
      code: `function bubbleSort(arr) {
  // Проверяем граничные случаи
  if (!Array.isArray(arr) || arr.length <= 1) return arr;
  
  // Создаем копию входного массива
  const array = [...arr];
  let len = array.length;
  let swapped;
  
  do {
    swapped = false;
    for (let i = 0; i < len - 1; i++) {
      // Сравниваем соседние элементы
      if (array[i] > array[i + 1]) {
        // Используем деструктурирующее присваивание для обмена
        [array[i], array[i + 1]] = [array[i + 1], array[i]];
        swapped = true;
      }
    }
    len--; // Оптимизация - уменьшаем область проверки
  } while (swapped);
  
  return array;
}`,
      metrics: { executionTime: 65, memoryUsage: 90, complexity: 'n^2' }
    }
  ],
  player2Progress: [
    {
      code: `function bubbleSort(arr) {
  let len = arr.length;
  for (let i = 0; i < len; i++) {
    for (let j = 0; j < len - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Меняем элементы местами
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}`,
      metrics: { executionTime: 120, memoryUsage: 85, complexity: 'n^2' }
    },
    {
      code: `function sort(arr) {
  // Используем встроенный метод сортировки JavaScript
  return arr.sort((a, b) => a - b);
}`,
      metrics: { executionTime: 45, memoryUsage: 70, complexity: 'n log n' }
    },
    {
      code: `function sort(arr) {
  // Проверка входных данных
  if (!Array.isArray(arr)) return [];
  if (arr.length <= 1) return arr;
  
  // Используем встроенный метод сортировки JavaScript
  return arr.sort((a, b) => a - b);
}`,
      metrics: { executionTime: 45, memoryUsage: 70, complexity: 'n log n' }
    },
    {
      code: `function sort(arr) {
  // Проверка входных данных
  if (!Array.isArray(arr)) return [];
  if (arr.length <= 1) return arr;
  
  // Создаем копию, чтобы не изменять оригинал
  const result = [...arr];
  
  // Используем встроенный метод сортировки JavaScript
  return result.sort((a, b) => a - b);
}`,
      metrics: { executionTime: 48, memoryUsage: 75, complexity: 'n log n' }
    },
    {
      code: `function sort(arr) {
  // Проверка входных данных
  if (!Array.isArray(arr)) return [];
  if (arr.length <= 1) return arr;
  
  // Оптимизация для числовых массивов
  if (arr.every(item => typeof item === 'number')) {
    const result = [...arr];
    return result.sort((a, b) => a - b);
  }
  
  // Для других типов данных (например, строк)
  const result = [...arr];
  return result.sort();
}`,
      metrics: { executionTime: 42, memoryUsage: 78, complexity: 'n log n' }
    }
  ]
};
