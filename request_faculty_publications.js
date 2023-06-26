const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const fs = require('fs');

async function retrieveArticlesWithResearchLinks() {
    const url = "https://anderson-review.ucla.edu/wp-json/wp/v2/posts";
    const params = {
        per_page: 10,
        _fields: "title,featured_media,link,acf"
    };

    const response = await fetch(url + "?" + new URLSearchParams(params));
    const data = await response.json();

    if (response.ok) {
        const researchLinks = {};

        for (const item of data) {
            const acf = item.acf;
            const featuredMediaId = item.featured_media;

            if (acf) {
                const researchIds = acf.article_attribution_research_by || [];

                for (const researchId of researchIds) {
                    const researchLink = await getResearchLinkById(researchId);

                    if (researchLink) {
                        if (researchLink in researchLinks) {
                            researchLinks[researchLink].push({
                                title: item.title.rendered,
                                link: item.link,
                                featured_media_link: await getFeaturedMediaLink(featuredMediaId)
                            });
                        } else {
                            researchLinks[researchLink] = [{
                                title: item.title.rendered,
                                link: item.link,
                                featured_media_link: await getFeaturedMediaLink(featuredMediaId)
                            }];
                        }
                    }
                }
            }
        }

        return researchLinks;
    } else {
        console.log("Failed to retrieve articles. Response status code:", response.status);
        return null;
    }
}

async function getResearchLinkById(researchId) {
    const url = `https://anderson-review.ucla.edu/wp-json/wp/v2/ucla_faculty_bio/${researchId}`;
    const response = await fetch(url);
    const data = await response.json();

    if (response.ok) {
        const link = data.link;
        return link;
    } else {
        console.log(`Failed to retrieve research link for ID ${researchId}. Response status code: ${response.status}`);
        return null;
    }
}

async function getFeaturedMediaLink(mediaId) {
    const url = `https://anderson-review.ucla.edu/wp-json/wp/v2/media/${mediaId}`;
    const response = await fetch(url);
    const data = await response.json();

    if (response.ok) {
        const sourceUrl = data.source_url;
        return sourceUrl;
    } else {
        console.log(`Failed to retrieve featured media link for ID ${mediaId}. Response status code: ${response.status}`);
        return null;
    }
}

// Example usage
retrieveArticlesWithResearchLinks()
    .then((researchLinks) => {
        if (researchLinks) {
            const jsonContent = JSON.stringify(researchLinks, null, 4);
            fs.writeFileSync("research_links.json", jsonContent);
            console.log("Research links saved to research_links.json file.");
        }
    })
    .catch((error) => {
        console.error("An error occurred:", error);
    });
    