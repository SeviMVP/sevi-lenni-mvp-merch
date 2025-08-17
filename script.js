
document.addEventListener("DOMContentLoaded", function() {
    const galleries = document.querySelectorAll(".gallery");
    galleries.forEach(gallery => {
        const images = gallery.querySelectorAll("img");
        let index = 0;

        gallery.addEventListener("click", () => {
            images[index].classList.remove("active");
            index = (index + 1) % images.length;
            images[index].classList.add("active");
        });
    });
});
