let customLoadFunction = getInfoFromServer;

function getInfoFromServer() {
    console.log("Loading info from server...");
    httpGetAsync("get_info.php?name=" + GAMENAME, loadFromServer);
    updateTime();
    if (turn !== YOURCOLOR) {
        document.getElementById("timeh").classList.add("active");
    } else {
        document.getElementById("opp-timeh").classList.add("active");
    }

    // Load canvas event listener
    eventListener();
}