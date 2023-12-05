// Get all the anchor elements in the navigation menu
const navLinks = document.querySelectorAll('nav a');
const sections = document.querySelectorAll('main > section');
const backToTops = document.querySelectorAll('.back-to-top');

// Add a click event listener to each anchor element
navLinks.forEach((link) => {
  link.addEventListener('click', function (event) {
    // Prevent the default behavior of the anchor element
    event.preventDefault();

    const targetid = event.currentTarget.href.split('#')[1];
    const target = document.getElementById(targetid)
    target.scrollIntoView();
    // Remove the "active" class from all anchor elements
    navLinks.forEach((link) => link.classList.remove('active'));

    // Add the "active" class to the clicked anchor element
    this.classList.add('active');
  });
});

// Prevent default a behavior and make the page scroll to the top
backToTops.forEach((link) => { 
  link.addEventListener('click', function (event) {
    event.preventDefault();
    document.getElementById('top').scrollIntoView();
  });
});

// Update navbar to show the 
window.addEventListener('scroll', function (event) { 
  sections.forEach((section, index) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    const currentScroll = window.scrollY;

    if (
      currentScroll >= sectionTop &&
      currentScroll < sectionTop + sectionHeight
    ) {
      navLinks[index].classList.add('active');
    } else {
      navLinks[index].classList.remove('active');
    }
  });
})