import Tesseract from 'tesseract.js';

// OCR class for processing images
class OCRProcessor {
  constructor() {
    this.worker = null;
    this.isInitialized = false;
  }

  // Initialize Tesseract worker
  async initialize() {
    if (this.isInitialized) return;

    try {
      this.worker = await Tesseract.createWorker({
        logger: m => {
          console.log('OCR Progress:', m);
        }
      });

      await this.worker.loadLanguage('eng');
      await this.worker.initialize('eng');
      
      // Set OCR parameters for better performance
      await this.worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,/-()[]',
        tessedit_pageseg_mode: Tesseract.PSM.AUTO,
      });

      this.isInitialized = true;
      console.log('OCR initialized successfully');
    } catch (error) {
      console.error('Error initializing OCR:', error);
      throw error;
    }
  }

  // Process image and extract text
  async processImage(imageFile) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const { data: { text } } = await this.worker.recognize(imageFile);
      return text;
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  }

  // Extract ingredients from text
  extractIngredients(text) {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const ingredients = [];
    
    // Common ingredient patterns
    const ingredientPatterns = [
      // Quantity + unit + ingredient (e.g., "2 cups flour", "1 lb chicken")
      /^(\d+(?:\.\d+)?)\s*([a-z]+)?\s+(.+)$/i,
      // Ingredient with quantity (e.g., "eggs (3)", "milk - 1 cup")
      /^([a-z\s]+)[\s\-\(]+(\d+(?:\.\d+)?)\s*([a-z]+)?/i,
      // Simple ingredient (e.g., "salt", "pepper")
      /^([a-z\s]+)$/i
    ];

    lines.forEach(line => {
      const cleanLine = line.trim();
      if (cleanLine.length < 2) return;

      // Skip lines that look like headers or instructions
      if (cleanLine.toLowerCase().includes('ingredients') || 
          cleanLine.toLowerCase().includes('instructions') ||
          cleanLine.toLowerCase().includes('directions') ||
          cleanLine.match(/^(step|method|recipe)/i)) {
        return;
      }

      // Try to match ingredient patterns
      let matched = false;
      for (const pattern of ingredientPatterns) {
        const match = cleanLine.match(pattern);
        if (match) {
          let ingredient = {
            name: '',
            quantity: '',
            unit: ''
          };

          if (pattern.source.includes('quantity')) {
            // Pattern with quantity first
            ingredient.quantity = match[1];
            ingredient.unit = match[2] || '';
            ingredient.name = match[3];
          } else if (pattern.source.includes('ingredient')) {
            // Pattern with ingredient first
            ingredient.name = match[1];
            ingredient.quantity = match[2] || '';
            ingredient.unit = match[3] || '';
          } else {
            // Simple ingredient
            ingredient.name = match[1];
          }

          ingredient.name = ingredient.name.trim();
          ingredient.quantity = ingredient.quantity.trim();
          ingredient.unit = ingredient.unit.trim();

          if (ingredient.name) {
            ingredients.push(ingredient);
            matched = true;
            break;
          }
        }
      }

      // If no pattern matched, treat as simple ingredient
      if (!matched && cleanLine.length > 0) {
        ingredients.push({
          name: cleanLine,
          quantity: '',
          unit: ''
        });
      }
    });

    return ingredients;
  }

  // Extract recipe information from text
  extractRecipeInfo(text) {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const recipe = {
      title: '',
      ingredients: [],
      instructions: [],
      prepTime: '',
      cookTime: '',
      servings: ''
    };

    let currentSection = 'title';
    let ingredientSection = false;
    let instructionSection = false;

    lines.forEach((line, index) => {
      const cleanLine = line.trim();
      const lowerLine = cleanLine.toLowerCase();

      // Detect sections
      if (lowerLine.includes('ingredients')) {
        ingredientSection = true;
        instructionSection = false;
        currentSection = 'ingredients';
        return;
      }

      if (lowerLine.includes('instructions') || lowerLine.includes('directions') || lowerLine.includes('method')) {
        ingredientSection = false;
        instructionSection = true;
        currentSection = 'instructions';
        return;
      }

      // Extract title (usually the first meaningful line)
      if (currentSection === 'title' && !recipe.title && cleanLine.length > 3) {
        recipe.title = cleanLine;
        return;
      }

      // Extract prep/cook time
      if (lowerLine.includes('prep') && lowerLine.includes('time')) {
        const timeMatch = cleanLine.match(/(\d+)\s*(min|hour|hr)/i);
        if (timeMatch) {
          recipe.prepTime = `${timeMatch[1]} ${timeMatch[2]}`;
        }
        return;
      }

      if (lowerLine.includes('cook') && lowerLine.includes('time')) {
        const timeMatch = cleanLine.match(/(\d+)\s*(min|hour|hr)/i);
        if (timeMatch) {
          recipe.cookTime = `${timeMatch[1]} ${timeMatch[2]}`;
        }
        return;
      }

      // Extract servings
      if (lowerLine.includes('serves') || lowerLine.includes('serving')) {
        const servingMatch = cleanLine.match(/(\d+)/);
        if (servingMatch) {
          recipe.servings = servingMatch[1];
        }
        return;
      }

      // Extract ingredients
      if (ingredientSection && cleanLine.length > 0) {
        const ingredients = this.extractIngredients(cleanLine);
        recipe.ingredients.push(...ingredients);
      }

      // Extract instructions
      if (instructionSection && cleanLine.length > 0) {
        // Skip numbered steps prefix
        const instruction = cleanLine.replace(/^\d+\.\s*/, '');
        if (instruction.length > 5) {
          recipe.instructions.push(instruction);
        }
      }
    });

    return recipe;
  }

  // Process receipt/grocery list image
  async processGroceryList(imageFile) {
    const text = await this.processImage(imageFile);
    return this.extractGroceryItems(text);
  }

  // Extract grocery items from text
  extractGroceryItems(text) {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const items = [];

    lines.forEach(line => {
      const cleanLine = line.trim();
      
      // Skip total lines, headers, etc.
      if (cleanLine.match(/^(total|subtotal|tax|receipt|store|date|time)/i) ||
          cleanLine.match(/^\$/) ||
          cleanLine.length < 2) {
        return;
      }

      // Try to extract item and price
      const priceMatch = cleanLine.match(/(.+?)\s+(\$?\d+\.\d{2})$/);
      if (priceMatch) {
        const itemName = priceMatch[1].trim();
        const price = priceMatch[2];
        
        if (itemName.length > 0) {
          items.push({
            name: itemName,
            price: price,
            quantity: 1
          });
        }
      } else {
        // No price found, treat as item name
        if (cleanLine.length > 0) {
          items.push({
            name: cleanLine,
            price: '',
            quantity: 1
          });
        }
      }
    });

    return items;
  }

  // Process pantry label image
  async processPantryLabel(imageFile) {
    const text = await this.processImage(imageFile);
    return this.extractPantryInfo(text);
  }

  // Extract pantry item information
  extractPantryInfo(text) {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const item = {
      name: '',
      expirationDate: '',
      quantity: '',
      unit: ''
    };

    lines.forEach(line => {
      const cleanLine = line.trim();
      const lowerLine = cleanLine.toLowerCase();

      // Extract expiration date
      if (lowerLine.includes('exp') || lowerLine.includes('best by') || lowerLine.includes('use by')) {
        const dateMatch = cleanLine.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
        if (dateMatch) {
          item.expirationDate = dateMatch[1];
        }
      }

      // Extract quantity and unit
      const quantityMatch = cleanLine.match(/(\d+(?:\.\d+)?)\s*(oz|lb|kg|g|ml|l|cup|tbsp|tsp|pint|quart|gallon)/i);
      if (quantityMatch) {
        item.quantity = quantityMatch[1];
        item.unit = quantityMatch[2];
      }

      // Extract product name (usually the longest line without numbers)
      if (!item.name && cleanLine.length > 3 && !cleanLine.match(/^\d/) && !lowerLine.includes('exp')) {
        item.name = cleanLine;
      }
    });

    return item;
  }

  // Cleanup worker
  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }
}

// Create singleton instance
const ocrProcessor = new OCRProcessor();

// Export functions for easy use
export const initializeOCR = () => ocrProcessor.initialize();
export const processImage = (imageFile) => ocrProcessor.processImage(imageFile);
export const extractIngredients = (text) => ocrProcessor.extractIngredients(text);
export const extractRecipeInfo = (text) => ocrProcessor.extractRecipeInfo(text);
export const processGroceryList = (imageFile) => ocrProcessor.processGroceryList(imageFile);
export const processPantryLabel = (imageFile) => ocrProcessor.processPantryLabel(imageFile);
export const terminateOCR = () => ocrProcessor.terminate();

// Image preprocessing utilities
export const preprocessImage = (canvas, imageFile) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      
      // Set canvas size
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image
      ctx.drawImage(img, 0, 0);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Convert to grayscale and increase contrast
      for (let i = 0; i < data.length; i += 4) {
        const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        
        // Increase contrast
        const contrast = 1.5;
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        const newGray = Math.min(255, Math.max(0, factor * (gray - 128) + 128));
        
        data[i] = newGray;     // Red
        data[i + 1] = newGray; // Green
        data[i + 2] = newGray; // Blue
      }
      
      // Put processed image data back
      ctx.putImageData(imageData, 0, 0);
      
      // Convert canvas to blob
      canvas.toBlob(resolve, 'image/jpeg', 0.9);
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(imageFile);
  });
};

// Camera utilities
export const startCamera = async (videoElement) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment', // Use back camera on mobile
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    });
    
    videoElement.srcObject = stream;
    await videoElement.play();
    return stream;
  } catch (error) {
    console.error('Error accessing camera:', error);
    throw error;
  }
};

export const captureImage = (videoElement, canvasElement) => {
  const canvas = canvasElement;
  const ctx = canvas.getContext('2d');
  
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  
  ctx.drawImage(videoElement, 0, 0);
  
  return new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', 0.9);
  });
};

export const stopCamera = (stream) => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
};

export default ocrProcessor;
