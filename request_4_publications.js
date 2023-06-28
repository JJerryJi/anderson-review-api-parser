const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { log } = require('console');
const fs = require('fs');

async function retrieveArticlesWithResearchLinks() {
    const url = "https://anderson-review.ucla.edu/wp-json/wp/v2/posts";
    const params = {
        per_page: 4,
        _fields: "title,featured_media,link,acf"
    };

    const response = await fetch(url + "?" + new URLSearchParams(params));
    const data = await response.json();

    if (response.ok) {
        const researchLinks = {};
        for (let i = 0; i < data.length; i++) {
            const link = data[i].link;
            const acf = data[i].acf;
            const title = data[i].title.rendered;
            const featuredMediaId = data[i].featured_media;


            const researchIds = acf.article_attribution_research_by || [];

            if (researchIds.length > 0) {
                const researcherLink = await getResearchLinkById(researchIds[0]); // Get only the first researcher's link

                if (researcherLink) {
                    researchLinks[i] = [{
                        title: title,
                        link: link,
                        featured_media_link: await getFeaturedMediaLink(featuredMediaId),
                        researcher: researcherLink
                    }];
                }
            }
            else {
                researchLinks[i] = [{
                    title: title,
                    link: link,
                    featured_media_link: await getFeaturedMediaLink(featuredMediaId),
                    researcher: "https://anderson-review.ucla.edu"
                }];
            }

        }
        return researchLinks;
    } else {
        console.log("Failed to retrieve articles. Response status code:", response.status);
        return "";
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
        return "";
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
        return "";
    }
}

async function HTMLParser(i) {
    try {
        const articlesPromise = retrieveArticlesWithResearchLinks();
        const articles = await articlesPromise;

        const featured_media = articles[i][0].featured_media_link;
        const researcher = articles[i][0].researcher
        const link = articles[i][0].link
        const researcherName = articles[i][0].researcher.split('/');
        const name = researcherName[researcherName.length - 2].split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        const htmlCode = `<div class="card h-100 card--default card--news-card news-scheme-lightgrey">
            <div class="row">
                <div class="col-sm-4 col-md-12">
                    <div class="news-card__field-image field-name-field-image field-type-entity-reference">
                        <div class="media media__image media__image--default">
                            <div class="image__field-media-image field-name-field-media-image field-type-image">
                                <img src="${featured_media}"
                                    width="448" height="252" alt="" loading="lazy" typeof="foaf:Image" class="img-fluid">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-sm-8 col-md-12">
                    <div class="card-body d-flex h-100">
                        <div class="card-content">
                            <div class="category-tag">
                                <h6>
                                    <a href="https://anderson-review.ucla.edu/">The UCLA Anderson Review</a>
                                </h6>
                            </div>
                            <h3 class="news-title">${name}</h3>
                            <div class="news-card__body field-name-body field-type-text-with-summary">
                                <p>It varies across goods and services and can be blunted by monetary policy</p>
                                <p><em>Featuring Research by <a
                                            href="${researcher}"
                                            target="_blank"></a></em>&nbsp;</p>
                            </div>
                        </div>
                        <div class="card-links">
                            <div class="news-card__field-link field-name-field-link field-type-link"><a
                                    href="${link}"
                                    target="_blank">Read More</a></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

        return htmlCode;
    } catch (error) {
        console.error('Error retrieving articles:', error);
    }
}


async function callRetrieveArticlesWithResearchLinks() {
    try {
        const results = [];
        const articlesPromise = retrieveArticlesWithResearchLinks();
        const articles = await articlesPromise;
        results.push(articles);
      
      const json = JSON.stringify(results, null, 2);
      fs.writeFileSync('research_4_links.json', json);
      console.log('Data saved to research_4_links.json file.');
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }
  
// HTMLParser(0)
//     .then((htmlCode) => {
//         if (htmlCode) {
//             fs.writeFileSync('output.html', htmlCode);
//             console.log('HTML code saved to output.html file.');
//         }
//     })
//     .catch((error) => {
//         console.error('An error occurred:', error);
//     });

callRetrieveArticlesWithResearchLinks();