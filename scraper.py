#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
切图狗网站资源爬虫
用于爬取设计相关资源、3D模型、科技感素材等
"""

import os
import time
import random
import json
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import concurrent.futures
from tqdm import tqdm

# 创建目录结构
def create_directories():
    """创建存储爬取内容的目录结构"""
    directories = [
        'scraped_data',
        'scraped_data/images',
        'scraped_data/3d_models',
        'scraped_data/design_inspiration',
        'scraped_data/fonts',
        'scraped_data/icons',
        'scraped_data/textures'
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"创建目录: {directory}")

# 设置请求头
def get_headers():
    """返回随机User-Agent的请求头"""
    user_agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36'
    ]
    return {
        'User-Agent': random.choice(user_agents),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
    }

# 下载文件
def download_file(url, folder, filename=None):
    """下载指定URL的文件到指定文件夹"""
    try:
        response = requests.get(url, headers=get_headers(), stream=True)
        response.raise_for_status()
        
        # 如果没有指定文件名，从URL中提取
        if not filename:
            filename = os.path.basename(urlparse(url).path)
            if not filename:
                filename = f"file_{int(time.time())}_{random.randint(1000, 9999)}"
        
        # 确保文件名有扩展名
        content_type = response.headers.get('Content-Type', '')
        if '.' not in filename:
            if 'image/jpeg' in content_type:
                filename += '.jpg'
            elif 'image/png' in content_type:
                filename += '.png'
            elif 'image/svg+xml' in content_type:
                filename += '.svg'
            elif 'application/json' in content_type:
                filename += '.json'
            elif 'text/html' in content_type:
                filename += '.html'
            else:
                filename += '.bin'
        
        file_path = os.path.join(folder, filename)
        
        # 下载文件
        with open(file_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        
        print(f"下载完成: {file_path}")
        return file_path
    except Exception as e:
        print(f"下载失败 {url}: {str(e)}")
        return None

# 爬取图片
def scrape_images(url, output_folder, limit=20):
    """从指定URL爬取图片"""
    try:
        print(f"正在从 {url} 爬取图片...")
        response = requests.get(url, headers=get_headers())
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        img_tags = soup.find_all('img')
        
        downloaded = 0
        image_urls = []
        
        # 收集图片URL
        for img in img_tags:
            if downloaded >= limit:
                break
                
            img_url = img.get('src') or img.get('data-src')
            if not img_url:
                continue
                
            # 转换为绝对URL
            img_url = urljoin(url, img_url)
            
            # 过滤掉小图标、广告等
            if img.get('width') and img.get('height'):
                try:
                    if int(img['width']) < 100 or int(img['height']) < 100:
                        continue
                except ValueError:
                    pass
            
            image_urls.append(img_url)
            downloaded += 1
        
        # 并行下载图片
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            list(tqdm(executor.map(
                lambda url: download_file(url, output_folder), 
                image_urls
            ), total=len(image_urls), desc="下载图片"))
            
        print(f"从 {url} 爬取了 {downloaded} 张图片")
        return downloaded
    except Exception as e:
        print(f"爬取图片失败 {url}: {str(e)}")
        return 0

# 爬取3D模型
def scrape_3d_models(url, output_folder, limit=10):
    """从指定URL爬取3D模型文件"""
    try:
        print(f"正在从 {url} 爬取3D模型...")
        response = requests.get(url, headers=get_headers())
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 查找可能的3D模型链接
        model_extensions = ['.obj', '.fbx', '.gltf', '.glb', '.stl', '.3ds', '.blend']
        links = soup.find_all('a', href=True)
        
        model_urls = []
        for link in links:
            href = link['href']
            if any(href.lower().endswith(ext) for ext in model_extensions):
                model_urls.append(urljoin(url, href))
                if len(model_urls) >= limit:
                    break
        
        # 并行下载模型
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            list(tqdm(executor.map(
                lambda url: download_file(url, output_folder), 
                model_urls
            ), total=len(model_urls), desc="下载3D模型"))
            
        print(f"从 {url} 爬取了 {len(model_urls)} 个3D模型")
        return len(model_urls)
    except Exception as e:
        print(f"爬取3D模型失败 {url}: {str(e)}")
        return 0

# 爬取设计灵感
def scrape_design_inspiration(urls, output_folder, limit_per_url=5):
    """从多个设计网站爬取灵感素材"""
    total_scraped = 0
    results = []
    
    for url in urls:
        try:
            print(f"正在从 {url} 爬取设计灵感...")
            response = requests.get(url, headers=get_headers())
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # 查找文章或设计作品
            articles = []
            
            # 尝试不同的选择器找到设计作品
            for selector in ['article', '.design-item', '.portfolio-item', '.work-item', '.project']:
                items = soup.select(selector)
                if items:
                    articles.extend(items[:limit_per_url])
                    if len(articles) >= limit_per_url:
                        articles = articles[:limit_per_url]
                        break
            
            # 如果没找到，尝试找大图片作为设计灵感
            if not articles:
                img_tags = soup.find_all('img', width=True, height=True)
                large_images = []
                for img in img_tags:
                    try:
                        if int(img['width']) > 300 and int(img['height']) > 300:
                            large_images.append(img)
                    except ValueError:
                        continue
                
                articles = large_images[:limit_per_url]
            
            # 处理找到的每个设计灵感
            for i, item in enumerate(articles):
                inspiration = {
                    'source_url': url,
                    'date_scraped': time.strftime('%Y-%m-%d %H:%M:%S')
                }
                
                # 尝试提取标题
                title_tag = item.find(['h1', 'h2', 'h3', 'h4', 'h5']) or item.find(class_=['title', 'heading'])
                inspiration['title'] = title_tag.get_text().strip() if title_tag else f"Design Inspiration {i+1}"
                
                # 尝试提取描述
                desc_tag = item.find(['p', 'div'], class_=['description', 'excerpt', 'summary'])
                inspiration['description'] = desc_tag.get_text().strip() if desc_tag else ""
                
                # 尝试提取图片
                img_tag = item.find('img')
                if img_tag and (img_tag.get('src') or img_tag.get('data-src')):
                    img_url = img_tag.get('src') or img_tag.get('data-src')
                    img_url = urljoin(url, img_url)
                    img_filename = f"inspiration_{int(time.time())}_{i}.jpg"
                    img_path = download_file(img_url, output_folder, img_filename)
                    inspiration['image'] = os.path.basename(img_path) if img_path else None
                
                results.append(inspiration)
                total_scraped += 1
            
            # 保存结果到JSON
            with open(os.path.join(output_folder, 'inspirations.json'), 'w', encoding='utf-8') as f:
                json.dump(results, f, ensure_ascii=False, indent=2)
                
            print(f"从 {url} 爬取了 {len(articles)} 个设计灵感")
        except Exception as e:
            print(f"爬取设计灵感失败 {url}: {str(e)}")
    
    return total_scraped

# 爬取字体
def scrape_fonts(url, output_folder, limit=5):
    """从指定URL爬取字体文件"""
    try:
        print(f"正在从 {url} 爬取字体...")
        response = requests.get(url, headers=get_headers())
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 查找字体文件链接
        font_extensions = ['.ttf', '.otf', '.woff', '.woff2']
        links = soup.find_all('a', href=True)
        
        font_urls = []
        for link in links:
            href = link['href']
            if any(href.lower().endswith(ext) for ext in font_extensions):
                font_urls.append(urljoin(url, href))
                if len(font_urls) >= limit:
                    break
        
        # 并行下载字体
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
            list(tqdm(executor.map(
                lambda url: download_file(url, output_folder), 
                font_urls
            ), total=len(font_urls), desc="下载字体"))
            
        print(f"从 {url} 爬取了 {len(font_urls)} 个字体")
        return len(font_urls)
    except Exception as e:
        print(f"爬取字体失败 {url}: {str(e)}")
        return 0

# 主函数
def main():
    """主函数，协调爬虫任务"""
    print("=== 切图狗网站资源爬虫启动 ===")
    create_directories()
    
    # 设计灵感网站
    design_websites = [
        'https://www.awwwards.com/',
        'https://dribbble.com/',
        'https://www.behance.net/',
        'https://www.designspiration.com/'
    ]
    
    # 3D模型网站
    model_websites = [
        'https://free3d.com/',
        'https://www.turbosquid.com/Search/3D-Models/free',
        'https://www.cgtrader.com/free-3d-models'
    ]
    
    # 字体网站
    font_websites = [
        'https://fonts.google.com/',
        'https://www.dafont.com/',
        'https://www.fontspace.com/'
    ]
    
    # 图片素材网站
    image_websites = [
        'https://unsplash.com/s/photos/futuristic',
        'https://www.pexels.com/search/technology/',
        'https://pixabay.com/images/search/cyber/'
    ]
    
    # 执行爬取任务
    print("\n=== 爬取设计灵感 ===")
    scrape_design_inspiration(design_websites, 'scraped_data/design_inspiration')
    
    print("\n=== 爬取3D模型 ===")
    for url in model_websites:
        scrape_3d_models(url, 'scraped_data/3d_models')
    
    print("\n=== 爬取字体 ===")
    for url in font_websites:
        scrape_fonts(url, 'scraped_data/fonts')
    
    print("\n=== 爬取图片 ===")
    for url in image_websites:
        scrape_images(url, 'scraped_data/images')
    
    print("\n=== 爬虫任务完成 ===")

if __name__ == "__main__":
    main() 