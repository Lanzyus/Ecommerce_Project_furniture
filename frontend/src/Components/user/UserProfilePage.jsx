import React from "react";
import UserInfo from "./UserInfo";
import styles from "./UserProfilePage.module.css";

const UserProfilePage = () => {
  return (
    <main className={styles.page}>

      {/* =========================================
          PAGE HERO
      ========================================= */}

      <section className={styles.profileHero}>

        <div className={styles.heroInner}>

          <span className={styles.eyebrow}>
            MY ACCOUNT
          </span>

          <h1>
            Your Sensational
            <br />
            <em>Home Journey</em>
          </h1>

          <p>
            Manage your personal information, view your
            orders, and keep track of your deliveries.
          </p>

        </div>

      </section>


      {/* =========================================
          PROFILE CONTENT
      ========================================= */}

      <section className={styles.profileSection}>

        <div className={styles.container}>

          <UserInfo />

        </div>

      </section>

    </main>
  );
};

export default UserProfilePage;








// import React from "react";
// import UserInfo from "./UserInfo";
// import styles from "./UserProfilePage.module.css";

// const UserProfilePage = () => {
//   return (
//     <main className={styles.page}>

//       {/* =====================================================
//           HERO
//       ====================================================== */}

//       <section className={styles.profileHero}>

//         <div className={styles.heroInner}>

//           <span className={styles.eyebrow}>
//             MY ACCOUNT
//           </span>

//           <h1>
//             Your Sensational
//             <br />
//             <em>Home Journey</em>
//           </h1>

//           <p>
//             Manage your personal information,
//             view your orders, and keep track
//             of your deliveries.
//           </p>

//         </div>

//       </section>


//       {/* =====================================================
//           PROFILE CONTENT
//       ====================================================== */}

//       <section className={styles.profileSection}>

//         <div className={styles.container}>

//           <UserInfo />

//         </div>

//       </section>

//     </main>
//   );
// };

// export default UserProfilePage;













// import React from "react";
// import UserInfo from "./UserInfo";
// import styles from "./UserProfilePage.module.css";

// const UserProfilePage = () => {
//   return (
//     <main className={styles.page}>
//       <section className={styles.profileHero}>
//         <div className={styles.heroInner}>
//           <span className={styles.eyebrow}>MY ACCOUNT</span>

//           <h1>
//             Your Sensational
//             <br />
//             <em>Home Journey</em>
//           </h1>

//           <p>
//             Manage your personal information, view your orders,
//             and keep track of your deliveries.
//           </p>
//         </div>
//       </section>

//       <section className={styles.profileSection}>
//         <div className={styles.container}>
//           <UserInfo />
//         </div>
//       </section>
//     </main>
//   );
// };

// export default UserProfilePage;



// // import React from 'react'
// // import UserInfo from './UserInfo'
// // import OrderHistoryItem from './OrderHistoryItem.jsX'


// // const UserProfilePage = () => {
// //   return (
   
// //        <div className="container my-5">
// //       {/* Profile Header */}

// //       <UserInfo />

// //       {/* Order History */}
// //       <OrderHistoryItemContainer />

// //     </div>
    
// //   )
// // }

// // export default UserProfilePage
