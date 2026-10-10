
/*
|--------------------------------------------------------------------------
| STORAGE KEYS
|--------------------------------------------------------------------------
*/

const LOGIN_KEY = "socialcraft.loggedIn";
const USER_KEY = "socialcraft.username";
const ROLE_KEY = "socialcraft.role";
const USERS_KEY = "socialcraft.users";


/*
|--------------------------------------------------------------------------
| DEFAULT USERS
|--------------------------------------------------------------------------
*/

const DEFAULT_USERS = [

  {
    username: "admin",
    password: "admin123",
    role: "admin"
  },

  {
    username: "user",
    password: "user123",
    role: "user"
  }

];


/*
|--------------------------------------------------------------------------
| CHECK LOGIN
|--------------------------------------------------------------------------
*/

const loggedIn =
  localStorage.getItem(LOGIN_KEY) === "true";

const currentRole =
  localStorage.getItem(ROLE_KEY);


if (!loggedIn || currentRole !== "admin") {

  window.location.href = "login.html";

}


/*
|--------------------------------------------------------------------------
| USER STORAGE
|--------------------------------------------------------------------------
*/

function getUsers() {

  const saved =
    localStorage.getItem(USERS_KEY);


  if (!saved) {

    localStorage.setItem(
      USERS_KEY,
      JSON.stringify(DEFAULT_USERS)
    );

    return [...DEFAULT_USERS];

  }


  try {

    return JSON.parse(saved);

  } catch (error) {

    localStorage.setItem(
      USERS_KEY,
      JSON.stringify(DEFAULT_USERS)
    );

    return [...DEFAULT_USERS];

  }

}


function saveUsers(users) {

  localStorage.setItem(
    USERS_KEY,
    JSON.stringify(users)
  );

}


/*
|--------------------------------------------------------------------------
| DOM READY
|--------------------------------------------------------------------------
*/

document.addEventListener(
  "DOMContentLoaded",
  () => {


    const adminUsername =
      document.getElementById(
        "adminUsername"
      );


    const currentUsername =
      localStorage.getItem(USER_KEY);


    if (adminUsername && currentUsername) {

      adminUsername.textContent =
        currentUsername;

    }



    /*
    |--------------------------------------------------------------------------
    | PANELS
    |--------------------------------------------------------------------------
    */

    const usersPanel =
      document.getElementById(
        "usersPanel"
      );

    const addUserPanel =
      document.getElementById(
        "addUserPanel"
      );


    const showUsersBtn =
      document.getElementById(
        "showUsersBtn"
      );

    const showAddUserBtn =
      document.getElementById(
        "showAddUserBtn"
      );

    const closeUsersBtn =
      document.getElementById(
        "closeUsersBtn"
      );

    const closeAddUserBtn =
      document.getElementById(
        "closeAddUserBtn"
      );



    /*
    |--------------------------------------------------------------------------
    | SHOW USERS
    |--------------------------------------------------------------------------
    */

    if (showUsersBtn) {

      showUsersBtn.addEventListener(
        "click",
        () => {

          usersPanel.style.display =
            "block";

          addUserPanel.style.display =
            "none";

          renderUsers();

          usersPanel.scrollIntoView({
            behavior: "smooth"
          });

        }
      );

    }



    /*
    |--------------------------------------------------------------------------
    | SHOW ADD USER
    |--------------------------------------------------------------------------
    */

    if (showAddUserBtn) {

      showAddUserBtn.addEventListener(
        "click",
        () => {

          addUserPanel.style.display =
            "block";

          usersPanel.style.display =
            "none";

          addUserPanel.scrollIntoView({
            behavior: "smooth"
          });

        }
      );

    }



    /*
    |--------------------------------------------------------------------------
    | CLOSE USERS
    |--------------------------------------------------------------------------
    */

    if (closeUsersBtn) {

      closeUsersBtn.addEventListener(
        "click",
        () => {

          usersPanel.style.display =
            "none";

        }
      );

    }



    /*
    |--------------------------------------------------------------------------
    | CLOSE ADD USER
    |--------------------------------------------------------------------------
    */

    if (closeAddUserBtn) {

      closeAddUserBtn.addEventListener(
        "click",
        () => {

          addUserPanel.style.display =
            "none";

        }
      );

    }



    /*
    |--------------------------------------------------------------------------
    | ADD USER FORM
    |--------------------------------------------------------------------------
    */

    const addUserForm =
      document.getElementById(
        "addUserForm"
      );

    const newUsername =
      document.getElementById(
        "newUsername"
      );

    const newPassword =
      document.getElementById(
        "newPassword"
      );

    const newRole =
      document.getElementById(
        "newRole"
      );

    const addUserMessage =
      document.getElementById(
        "addUserMessage"
      );



    if (addUserForm) {

      addUserForm.addEventListener(
        "submit",
        (event) => {

          event.preventDefault();


          const username =
            newUsername.value.trim();

          const password =
            newPassword.value;

          const role =
            newRole.value;


          addUserMessage.textContent =
            "";

          addUserMessage.className =
            "admin-message";


          if (!username || !password) {

            addUserMessage.textContent =
              "Please complete all fields.";

            addUserMessage.classList.add(
              "error"
            );

            return;

          }


          if (username.length < 3) {

            addUserMessage.textContent =
              "Username must be at least 3 characters.";

            addUserMessage.classList.add(
              "error"
            );

            return;

          }


          if (password.length < 4) {

            addUserMessage.textContent =
              "Password must be at least 4 characters.";

            addUserMessage.classList.add(
              "error"
            );

            return;

          }


          const users =
            getUsers();


          const exists =
            users.some(
              (user) =>
                user.username.toLowerCase() ===
                username.toLowerCase()
            );


          if (exists) {

            addUserMessage.textContent =
              "Username already exists.";

            addUserMessage.classList.add(
              "error"
            );

            return;

          }


          users.push({

            username: username,

            password: password,

            role: role

          });


          saveUsers(users);


          addUserMessage.textContent =
            "User created successfully!";

          addUserMessage.classList.add(
            "success"
          );


          addUserForm.reset();


          renderUsers();

        }
      );

    }



    /*
    |--------------------------------------------------------------------------
    | LOGOUT
    |--------------------------------------------------------------------------
    */

    const logoutBtn =
      document.getElementById(
        "logoutBtn"
      );


    if (logoutBtn) {

      logoutBtn.addEventListener(
        "click",
        () => {

          localStorage.removeItem(
            LOGIN_KEY
          );

          localStorage.removeItem(
            USER_KEY
          );

          localStorage.removeItem(
            ROLE_KEY
          );

          window.location.href =
            "login.html";

        }
      );

    }



    /*
    |--------------------------------------------------------------------------
    | RENDER USERS
    |--------------------------------------------------------------------------
    */

    function renderUsers() {

      const usersList =
        document.getElementById(
          "usersList"
        );


      if (!usersList) {
        return;
      }


      const users =
        getUsers();


      usersList.innerHTML = "";


      users.forEach(
        (user, index) => {


          const item =
            document.createElement(
              "div"
            );

          item.className =
            "user-item";


          const information =
            document.createElement(
              "div"
            );

          information.className =
            "user-information";


          const username =
            document.createElement(
              "strong"
            );

          username.textContent =
            user.username;


          const role =
            document.createElement(
              "span"
            );

          role.className =
            "user-role";

          role.textContent =
            user.role.toUpperCase();


          information.appendChild(
            username
          );

          information.appendChild(
            role
          );


          const deleteButton =
            document.createElement(
              "button"
            );

          deleteButton.type =
            "button";

          deleteButton.className =
            "delete-user-btn";

          deleteButton.textContent =
            "Delete";


          /*
          |--------------------------------------------------------------------------
          | PREVENT ADMIN FROM DELETING CURRENT ADMIN
          |--------------------------------------------------------------------------
          */

          if (
            user.username ===
            currentUsername
          ) {

            deleteButton.disabled =
              true;

            deleteButton.textContent =
              "Current User";

          }


          deleteButton.addEventListener(
            "click",
            () => {

              deleteUser(index);

            }
          );


          item.appendChild(
            information
          );

          item.appendChild(
            deleteButton
          );


          usersList.appendChild(
            item
          );

        }
      );

    }



    /*
    |--------------------------------------------------------------------------
    | DELETE USER
    |--------------------------------------------------------------------------
    */

    function deleteUser(index) {

      const users =
        getUsers();


      const selectedUser =
        users[index];


      if (!selectedUser) {
        return;
      }


      if (
        selectedUser.username ===
        currentUsername
      ) {

        alert(
          "You cannot delete your own account."
        );

        return;

      }


      const confirmed =
        confirm(
          `Delete user "${selectedUser.username}"?`
        );


      if (!confirmed) {
        return;
      }


      users.splice(
        index,
        1
      );


      saveUsers(users);


      renderUsers();

    }


  }
);
