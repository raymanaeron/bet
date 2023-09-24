import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Product } from './data-models/Product';
import { Customer } from './data-models/Customer';


@Injectable({
    providedIn: 'root'
  })
export class MockDataUtil {

    private static randomIntFromInterval(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    static getProducts(count = 100): Product[] {
        const products: Product[] = [];
        const productNames = ['Widget', 'Gadget', 'Doodad', 'Thingamajig', 'Whatsit', 'Dinglehopper', 'Doohickey'];

        for (let i = 0; i < count; i++) {
            const randomNameIndex = this.randomIntFromInterval(0, productNames.length - 1);
            const randomPrice = this.randomIntFromInterval(10, 1000);

            products.push({
                product_id: `prod-${i}-${Date.now()}`,
                product_name: `${productNames[randomNameIndex]} ${i}`,
                price: randomPrice
            });
        }

        return products;
    }

    getCustomers() {

    }
}