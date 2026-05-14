/**
 * Prisma 数据库种子脚本
 * 用于初始化测试数据
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('开始数据库种子初始化...');

  // 创建测试用户
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  const user = await prisma.user.upsert({
    where: { phone: '13800138000' },
    update: {},
    create: {
      phone: '13800138000',
      name: '测试摊主',
      level: 'gold',
      totalOrders: 156,
      totalRevenue: 25800,
      totalCustomers: 892,
    },
  });

  console.log('创建用户:', user.name);

  // 创建测试商品
  const products = [
    { name: '网红柠檬茶', category: '饮品', price: 15, cost: 5, stock: 100 },
    { name: '手工冰粉', category: '甜品', price: 12, cost: 3, stock: 80 },
    { name: '脆皮烤肠', category: '小吃', price: 8, cost: 3, stock: 150 },
    { name: '铁板鱿鱼', category: '小吃', price: 20, cost: 8, stock: 50 },
    { name: '奶茶冰沙', category: '饮品', price: 18, cost: 6, stock: 60 },
    { name: '炸鸡柳', category: '小吃', price: 10, cost: 4, stock: 120 },
  ];

  for (const productData of products) {
    await prisma.product.upsert({
      where: {
        id_userId: {
          id: `${productData.name}-${user.id}`,
          userId: user.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        name: productData.name,
        category: productData.category,
        price: productData.price,
        cost: productData.cost,
        stock: productData.stock,
        lowStockThreshold: 20,
        description: `${productData.name} - 精选优质原料制作`,
      },
    });
  }

  console.log('创建商品:', products.length, '个');

  // 创建测试供应商
  const suppliers = [
    { name: '广州茶饮原料批发', category: 'food', phone: '13900139001', minOrder: 500, rating: 4.8 },
    { name: '四川冰粉原料供应商', category: 'food', phone: '13900139002', minOrder: 300, rating: 4.6 },
    { name: '山东肉制品批发中心', category: 'food', phone: '13900139003', minOrder: 1000, rating: 4.9 },
    { name: '杭州包装材料厂', category: 'materials', phone: '13900139004', minOrder: 200, rating: 4.5 },
    { name: '深圳厨具设备商城', category: 'equipment', phone: '13900139005', minOrder: 1000, rating: 4.7 },
  ];

  for (const supplierData of suppliers) {
    await prisma.supplier.upsert({
      where: { id: supplierData.name },
      update: {},
      create: {
        id: supplierData.name,
        ...supplierData,
        verified: true,
        productCount: Math.floor(Math.random() * 50) + 10,
        deliveryDays: '1-3',
        ordersServed: Math.floor(Math.random() * 500) + 100,
      },
    });
  }

  console.log('创建供应商:', suppliers.length, '个');

  // 创建测试交易记录
  const transactions = [
    { type: 'income', amount: 150, category: '零售', description: '下午茶时段销售' },
    { type: 'income', amount: 280, category: '零售', description: '晚高峰时段销售' },
    { type: 'expense', amount: 200, category: '进货', description: '原材料补货' },
    { type: 'income', amount: 450, category: '批发', description: '批发订单' },
    { type: 'expense', amount: 50, category: '耗材', description: '包装袋采购' },
  ];

  for (const txData of transactions) {
    await prisma.transaction.create({
      data: {
        userId: user.id,
        ...txData,
      },
    });
  }

  console.log('创建交易记录:', transactions.length, '条');

  // 创建测试社区帖子
  const posts = [
    {
      category: 'experience',
      title: '分享我的摆摊创业之路',
      content: '从最初的小推车到现在月入过万，这些年摆摊让我学到了很多。关键是要选对位置，了解顾客需求，不断优化产品。',
    },
    {
      category: 'help',
      title: '新手求教：哪里进货最便宜？',
      content: '刚入行不久，想问问各位大佬在哪里进货比较划算？想要找性价比高的货源。',
    },
    {
      category: 'trade',
      title: '转让九成新冰柜一台',
      content: '因店铺扩张，现有一台九成新冰柜转让，容量200L，适合小摊位使用。有意者请联系。',
    },
  ];

  for (const postData of posts) {
    await prisma.post.create({
      data: {
        userId: user.id,
        ...postData,
      },
    });
  }

  console.log('创建社区帖子:', posts.length, '篇');

  console.log('数据库种子初始化完成!');
}

main()
  .catch((e) => {
    console.error('种子脚本执行失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
