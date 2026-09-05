import axios from "axios";

export const BASE_URL =
  "http://127.0.0.1:8001";

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("access");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;









// import axios from "axios";

// export const BASE_URL = "http://127.0.0.1:8001";

// const api = axios.create({
//   baseURL: "http://127.0.0.1:8001/api",
// });

// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("access");

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// export default api;




// import axios from "axios";

// export const BASE_URL = "http://127.0.0.1:8001";

// const api = axios.create({
//   baseURL: `${BASE_URL}/api`,
// });

// // export default api;


// // import axios from "axios";

// // export const BASE_URL = "http://127.0.0.1:8001";

// // const api = axios.create({
// //   baseURL: `${BASE_URL}/api/`,
// // });

// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("access");

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// export default api; 

// import axios from "axios";
// import { jwtDecode } from "jwt-decode";

// export const BASE_URL = "http://127.0.0.1:8001";

// const api = axios.create({
//   baseURL: `${BASE_URL}/api/`,
// });

// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("access");

//     if (token) {
//       try {
//         const decoded = jwtDecode(token);

//         if (decoded.exp > Date.now() / 1000) {
//           config.headers.Authorization = `Bearer ${token}`;
//         } else {
//           localStorage.removeItem("access");
//           localStorage.removeItem("refresh");
//         }
//       } catch (error) {
//         console.error("JWT decode failed:", error);
//       }
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// export default api;



// import axios from "axios";
// import { jwtDecode } from "jwt-decode";

// export const BASE_URL = "http://127.0.0.1:8001";

// const api = axios.create({
//   baseURL: `${BASE_URL}/api`, // ONLY HERE
// });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("access");

//   if (token) {
//     try {
//       const decoded = jwtDecode(token);
//       if (decoded.exp > Date.now() / 1000) {
//         config.headers.Authorization = `Bearer ${token}`;
//       }
//     } catch (err) {
//       console.error("Token decode error:", err);
//     }
//   }

//   return config;
// });

// export default api;

// import axios from "axios";
// import { jwtDecode } from "jwt-decode";

// export const BASE_URL = "http://127.0.0.1:8001";

// const api = axios.create({
//   baseURL: `${BASE_URL}/api`,
// });

// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("access");

//     if (token) {
//       try {
//         const decoded = jwtDecode(token);

//         if (decoded.exp > Date.now() / 1000) {
//           config.headers.Authorization = `Bearer ${token}`;
//         }
//       } catch (err) {
//         console.error("Token decode error:", err);
//       }
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// export default api;

// import axios from "axios";
// import { jwtDecode } from "jwt-decode";

// export const BASE_URL = "http://127.0.0.1:8001";


// const api = axios.create({
//   baseURL: `${BASE_URL}/api`,
// });

// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("access");

//     if (token) {
//       try {
//         const decoded = jwtDecode(token);

//         if (decoded.exp > Date.now() / 1000) {
//           config.headers.Authorization = `Bearer ${token}`;
//         }
//       } catch (err) {
//         console.error("Token decode error:", err);
//       }
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// export default api;


//  import axios from "axios";
// import { jwtDecode } from "jwt-decode";

// export const BASE_URL = "http://127.0.0.1:8001/api";

// const api = axios.create({
//   baseURL: BASE_URL,
// });
 
// // export const BASE_URL = "http://localhost:8001";

// // const api = axios.create({
// //   baseURL: `${BASE_URL}/api`,
// // });


// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("access");

//     if (token) {
//       try {
//         const decoded = jwtDecode(token);

//         const expiryDate = decoded.exp;
//         const currentTime = Date.now() / 1000;

//         if (expiryDate > currentTime) {
//           config.headers = config.headers || {};
//           config.headers.Authorization = `Bearer ${token}`;
//         } else {
//           console.warn("Access token expired");

//           localStorage.removeItem("access");
//           localStorage.removeItem("refresh");
//         }
//       } catch (error) {
//         console.error("Invalid token:", error);

//         localStorage.removeItem("access");
//         localStorage.removeItem("refresh");
//       }
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// export default api;



// import axios from "axios";
// import { jwtDecode } from "jwt-decode";

// export const BASE_URL = "http://127.0.0.1:8001";

// const api = axios.create({
//   baseURL: BASE_URL,
// });

// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("access");

//     if (token) {
//       try {
//         const decoded = jwtDecode(token);
//         const expiry_date = decoded.exp;
//         const current_time = Date.now() / 1000;

//         if (expiry_date > current_time) {
//           config.headers.Authorization = `Bearer ${token}`;
//         } else {
//           localStorage.removeItem("access");
//           localStorage.removeItem("refresh");
//         }
//       } catch (error) {
//         console.error("Invalid token:", error);
//       }
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// export default api;



// import axios from "axios";

// export const BASE_URL = "http://localhost:8001";

// const api = axios.create({
//   baseURL: `${BASE_URL}/api`,
// });

// export default api;


// import axios from "axios";

// export const BASE_URL = "http://localhost:8001";

// const api = axios.create({
//   baseURL: `${BASE_URL}/api`,
// });

// export default api;

