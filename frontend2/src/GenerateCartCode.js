// GenerateCartCode.js

export function generateCartCode(prefix = "CART") {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  const array = new Uint8Array(8);

  // fallback for environments where crypto is not available
  if (window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }

  let randomPart = "";

  for (let i = 0; i < array.length; i++) {
    randomPart += characters[array[i] % characters.length];
  }

  const timestamp = Date.now().toString(36);

  return `${prefix}-${timestamp}-${randomPart}`;
}


// export function generateRandomAlphanumeric(length = 12) {
//   const characters =
//     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

//   let result = "";

//   for (let i = 0; i < length; i++) {
//     const randomIndex = Math.floor(Math.random() * characters.length);
//     result += characters[randomIndex];
//   }

//   return result;
// }




// function generateRandomAlphanumeric(length = 10) {
//     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     let result = '';
//     for (let i = 0; i < length; i++) {
//         const randomIndex = Math.floor(Math.random() * characters.length);
//         result += characters[randomIndex];
//     }
//     return result;
// }

// export const randomValue = generateRandomAlphanumeric();
