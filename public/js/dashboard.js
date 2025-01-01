// add hovered class to selected list item
let list = document.querySelectorAll(".navigation li");

function activeLink() {
  list.forEach((item) => {
    item.classList.remove("hovered");
  });
  this.classList.add("hovered");
}

list.forEach((item) => item.addEventListener("mouseover", activeLink));

// Menu Toggle
let toggle = document.querySelector(".toggle");
let navigation = document.querySelector(".navigation");
let main = document.querySelector(".main");

toggle.onclick = function () {
  navigation.classList.toggle("active");
  main.classList.toggle("active");
};


document.addEventListener("DOMContentLoaded", () => {
  function toggleMenu() {
    const subMenu = document.getElementById("subMenu");
    if (subMenu) {
      subMenu.classList.toggle("open-menu");
      console.log("Current classes:", subMenu.className); // Лог текущих классов
    } else {
      console.error("SubMenu not found!");
    }
  }

  const userImg = document.querySelector(".user img");
  if (userImg) {
    userImg.addEventListener("click", toggleMenu);
  }
});








