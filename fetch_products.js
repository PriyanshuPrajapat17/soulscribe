const SHOP_URL = "website-3000-namashree.myshopify.com";
const STOREFRONT_TOKEN = "04e046afb6cdb1602f3d74fa2adad958";
const fs = require('fs');

async function run() {
  const query = `
  {
    collections(first: 20) {
      nodes {
        id
        title
        handle
        products(first: 50) {
          nodes {
            id
            title
            handle
            description
            featuredImage {
              url
            }
            variants(first: 10) {
              nodes {
                id
                title
                price {
                  amount
                  currencyCode
                }
                availableForSale
              }
            }
          }
        }
      }
    }
    products(first: 50) {
      nodes {
        id
        title
        handle
        description
        featuredImage {
          url
        }
        images(first: 10) {
          nodes {
            url
          }
        }
        variants(first: 10) {
          nodes {
            id
            title
            price {
              amount
              currencyCode
            }
            availableForSale
          }
        }
      }
    }
  }
  `;

  try {
    const response = await fetch(
      `https://${SHOP_URL}/api/2025-01/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN
        },
        body: JSON.stringify({ query })
      }
    );

    const data = await response.json();
    fs.writeFileSync('products_data.json', JSON.stringify(data, null, 2));
    console.log("Data written to products_data.json successfully.");
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
