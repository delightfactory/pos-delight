
import Papa from 'papaparse';
import type { Database } from '../types';

type ProductInsert = Database['pos']['Tables']['products']['Insert'];

export const parseProductsCSV = (file: File): Promise<ProductInsert[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const products: ProductInsert[] = [];

                results.data.forEach((row: any) => {
                    // Validation: Must have name and price
                    if (!row.name || !row.price) return;

                    // Parse Images JSON
                    let imageUrl = null;
                    try {
                        if (row.images) {
                            const images = JSON.parse(row.images);
                            if (Array.isArray(images) && images.length > 0) {
                                imageUrl = images[0];
                            }
                        }
                    } catch (e) {
                        console.warn('Failed to parse images JSON for product:', row.name);
                    }

                    // Parse Prices
                    const price = parseFloat(row.price);
                    let salePrice = row.discount_price ? parseFloat(row.discount_price) : null;

                    if (isNaN(price)) return; // Skip invalid price
                    if (salePrice !== null && isNaN(salePrice)) salePrice = null;

                    // Use provided ID or undefined to let DB generate (though CSV usually provides UUIDs we want to keep)
                    const id = row.id && row.id.length > 0 ? row.id : undefined;

                    products.push({
                        id,
                        name: row.name,
                        code: row.product_code || row.sku || null, // Fallback to SKU if product_code empty
                        price,
                        sale_price: salePrice,
                        stock: row.stock ? parseInt(row.stock) : 0,
                        image_url: imageUrl,
                        category: row.category || null,
                        description: row.description || null,
                        is_featured: row.is_featured === 'true' || row.is_featured === true,
                    });
                });

                resolve(products);
            },
            error: (error) => {
                reject(error);
            }
        });
    });
};
