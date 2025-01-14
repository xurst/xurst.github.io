export const aboutContentData = {
    who: `
        <h3>info about me</h3>
        <p>hello! i'm xurst, a computer programmer specializing in creating apps, websites, and games. most of my projects are available on github, where you can explore, star, review, fork, or even submit pull requests to my repositories. (WIP)</p>
    `,
    languages: `
        <h3>my programming knowledge</h3>
        <ul class="languages-list">
            <li>javascript</li>
            <li>python</li>
            <li>C#/C++</li>
            <li>html/css</li>
            <li>lua</li>
        </ul>
    `
};

export function initializeAboutContent() {
    const aboutSelector = document.getElementById('aboutSelector');
    const aboutContent = document.getElementById('aboutContent');

    aboutSelector.addEventListener('change', (e) => {
        aboutContent.innerHTML = aboutContentData[e.target.value];
    });

    aboutContent.innerHTML = aboutContentData[aboutSelector.value];
}