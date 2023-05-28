const track = document.getElementById('forecast-track');

window.onmousedown = (e) => {
    track.dataset.mouseDownAt = e.clientX;
}
window.onmouseup = () => {
    track.dataset.mouseDownAt = "0";
    track.dataset.prevPrecentage = track.dataset.percentage;
}

window.onmousemove = (e) => {
    if (track.dataset.mouseDownAt === "0")
        return;
    const mouseDelta = parseFloat(track.dataset.mouseDownAt) - e.clientX,
        maxDelta = window.innerWidth / 2;

    const percentage = (mouseDelta / maxDelta) * -100,
        nextPercentage = parseFloat(track.dataset.prevPrecentage) + percentage;

    track.dataset.percentage = nextPercentage;

    track.style.transform = `translate(${nextPercentage}%, -50%)`;

    Math.min(nextPercentage, 0);
    Math.max(nextPercentage, -100);
    }