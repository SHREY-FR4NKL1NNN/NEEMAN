import requests
import csv
import sys
from bs4 import BeautifulSoup
import json
import os

PRODUCTS_JSON_URL = "https://neemans.com/products.json"
REVIEWS_DIR = os.path.join(os.path.dirname(__file__), "reviews")


def fetch_judgeme_reviews(product_id, shop_domain, per_page=50):
    page = 1
    all_reviews = []
    while True:
        url = (
            f"https://api.judge.me/reviews/reviews_for_widget?"
            f"url={shop_domain}&shop_domain={shop_domain}&platform=shopify&"
            f"page={page}&per_page={per_page}&product_id={product_id}"
        )
        response = requests.get(url)
        if response.status_code != 200:
            print(f"Failed to fetch page {page}: {response.status_code}")
            break
        data = response.json()
        html = data.get("html", "")
        if not html:
            break
        soup = BeautifulSoup(html, "html.parser")
        reviews = soup.find_all("div", class_="jdgm-rev")
        if not reviews:
            break
        for review in reviews:
            review_id = review.get("data-review-id", "")
            verified_buyer = review.get("data-verified-buyer", "")
            product_title = review.get("data-product-title", "")
            product_url = review.get("data-product-url", "")
            rating = review.find("span", class_="jdgm-rev__rating")
            score = rating.get("data-score", "") if rating else ""
            timestamp = review.find("span", class_="jdgm-rev__timestamp")
            date = timestamp.get("data-content", "") if timestamp else ""
            author = review.find("span", class_="jdgm-rev__author")
            author_name = author.text.strip() if author else ""
            title = review.find("b", class_="jdgm-rev__title")
            review_title = title.text.strip() if title else ""
            body = review.find("div", class_="jdgm-rev__body")
            review_body = body.text.strip() if body else ""
            # Extract images
            pics_div = review.find("div", class_="jdgm-rev__pics")
            images = []
            if pics_div:
                for a in pics_div.find_all("a", class_="jdgm-rev__pic-link"):
                    img = a.find("img")
                    if img and img.has_attr("data-src"):
                        images.append(img["data-src"])
            all_reviews.append({
                "review_id": review_id,
                "verified_buyer": verified_buyer,
                "product_title": product_title,
                "product_url": product_url,
                "score": score,
                "date": date,
                "author": author_name,
                "title": review_title,
                "body": review_body,
                "images": ";".join(images),
            })
        # Check if there are more pages
        paginate = soup.find("div", class_="jdgm-paginate")
        if paginate:
            next_page = paginate.find("a", class_="jdgm-paginate__next-page")
            if not next_page or next_page.get("data-page") == str(page):
                break
        else:
            break
        page += 1
    return all_reviews

def save_reviews_to_json(reviews, handle):
    if not os.path.exists(REVIEWS_DIR):
        os.makedirs(REVIEWS_DIR)
    filename = os.path.join(REVIEWS_DIR, f"{handle}.json")
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(reviews, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(reviews)} reviews to {filename}")

def fetch_all_products():
    print("Fetching all products from Shopify...")
    products = []
    seen_ids = set()
    page = 1
    while True:
        url = f"{PRODUCTS_JSON_URL}?page={page}"
        print(f"Fetching page {page} ...")
        resp = requests.get(url)
        if resp.status_code != 200:
            print(f"Failed to fetch products page {page}: {resp.status_code}")
            break
        data = resp.json()
        page_products = data.get("products", [])
        if not page_products:
            break
        for prod in page_products:
            # Only add main products, not variants, and avoid duplicates
            if prod.get("id") and prod.get("handle") and prod["id"] not in seen_ids:
                products.append(prod)
                seen_ids.add(prod["id"])
        page += 1
    print(f"Fetched {len(products)} unique main products.")
    return products

def main():
    shop_domain = "neemans.com"
    products = fetch_all_products()
    # No slicing: process all products
    all_reviews_path = os.path.join(os.path.dirname(__file__), "all_reviews.json")
    # Load existing reviews if file exists
    if os.path.exists(all_reviews_path):
        with open(all_reviews_path, "r", encoding="utf-8") as f:
            all_reviews_map = json.load(f)
    else:
        all_reviews_map = {}
    for i, product in enumerate(products):
        product_id = product.get("id")
        handle = product.get("handle")
        if not product_id or not handle or handle in all_reviews_map:
            continue
        print(f"[{i+1}/{len(products)}] Fetching reviews for {handle} (ID: {product_id})...")
        reviews = fetch_judgeme_reviews(product_id, shop_domain)
        print(f"Fetched {len(reviews)} reviews for {handle}")
        all_reviews_map[handle] = reviews
        # Save progress after each product
        with open(all_reviews_path, "w", encoding="utf-8") as f:
            json.dump(all_reviews_map, f, ensure_ascii=False, indent=2)
    print(f"Saved all reviews to {all_reviews_path}")

if __name__ == "__main__":
    main() 