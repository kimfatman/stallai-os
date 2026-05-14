import * as yup from 'yup';

// Product validation schema
export const productSchema = yup.object({
  name: yup
    .string()
    .required('请输入商品名称')
    .min(2, '商品名称至少2个字符')
    .max(50, '商品名称最多50个字符'),
  category: yup
    .string()
    .required('请选择商品分类'),
  price: yup
    .number()
    .required('请输入售价')
    .positive('售价必须大于0')
    .max(99999, '售价不能超过99999'),
  cost: yup
    .number()
    .required('请输入成本')
    .min(0, '成本不能为负数')
    .max(99999, '成本不能超过99999'),
  stock: yup
    .number()
    .required('请输入库存数量')
    .integer('库存数量必须为整数')
    .min(0, '库存数量不能为负数'),
  description: yup
    .string()
    .max(500, '描述最多500个字符'),
});

// Transaction validation schema
export const transactionSchema = yup.object({
  type: yup
    .string()
    .oneOf(['income', 'expense'], '请选择交易类型')
    .required('请选择交易类型'),
  amount: yup
    .number()
    .required('请输入金额')
    .positive('金额必须大于0')
    .max(9999999, '金额不能超过9999999'),
  category: yup
    .string()
    .required('请选择分类'),
  description: yup
    .string()
    .max(200, '备注最多200个字符'),
  date: yup
    .date()
    .default(() => new Date()),
});

// Inventory validation schema
export const inventorySchema = yup.object({
  name: yup
    .string()
    .required('请输入商品名称')
    .min(2, '商品名称至少2个字符')
    .max(50, '商品名称最多50个字符'),
  category: yup
    .string()
    .required('请选择分类'),
  currentStock: yup
    .number()
    .required('请输入当前库存')
    .integer('库存必须为整数')
    .min(0, '库存不能为负数'),
  minStock: yup
    .number()
    .required('请输入最低库存')
    .integer('最低库存必须为整数')
    .min(0, '最低库存不能为负数'),
  unit: yup
    .string()
    .required('请选择单位'),
  cost: yup
    .number()
    .required('请输入成本')
    .min(0, '成本不能为负数'),
});

// Supplier validation schema
export const supplierSchema = yup.object({
  name: yup
    .string()
    .required('请输入供应商名称')
    .min(2, '名称至少2个字符')
    .max(100, '名称最多100个字符'),
  category: yup
    .string()
    .required('请选择分类'),
  phone: yup
    .string()
    .matches(/^1[3-9]\d{9}$/, '请输入正确的手机号'),
  address: yup
    .string()
    .max(200, '地址最多200个字符'),
  minOrder: yup
    .number()
    .min(0, '起订金额不能为负数'),
});

// Profile validation schema
export const profileSchema = yup.object({
  nickname: yup
    .string()
    .required('请输入昵称')
    .min(2, '昵称至少2个字符')
    .max(20, '昵称最多20个字符'),
  phone: yup
    .string()
    .matches(/^1[3-9]\d{9}$/, '请输入正确的手机号'),
  email: yup
    .string()
    .email('请输入正确的邮箱'),
});

// Post validation schema
export const postSchema = yup.object({
  content: yup
    .string()
    .required('请输入内容')
    .min(10, '内容至少10个字符')
    .max(2000, '内容最多2000个字符'),
  tags: yup
    .array()
    .of(yup.string())
    .max(5, '最多添加5个标签'),
});

// Login validation schema
export const loginSchema = yup.object({
  phone: yup
    .string()
    .required('请输入手机号')
    .matches(/^1[3-9]\d{9}$/, '请输入正确的手机号'),
  password: yup
    .string()
    .required('请输入密码')
    .min(6, '密码至少6个字符'),
});

// Register validation schema
export const registerSchema = yup.object({
  phone: yup
    .string()
    .required('请输入手机号')
    .matches(/^1[3-9]\d{9}$/, '请输入正确的手机号'),
  password: yup
    .string()
    .required('请输入密码')
    .min(6, '密码至少6个字符')
    .matches(/[A-Z]/, '密码必须包含大写字母')
    .matches(/[a-z]/, '密码必须包含小写字母')
    .matches(/[0-9]/, '密码必须包含数字'),
  confirmPassword: yup
    .string()
    .required('请确认密码')
    .oneOf([yup.ref('password')], '两次密码输入不一致'),
  nickname: yup
    .string()
    .required('请输入昵称')
    .min(2, '昵称至少2个字符')
    .max(20, '昵称最多20个字符'),
});

// Validation helper function
export async function validateData<T>(
  schema: yup.ObjectSchema<T>,
  data: unknown
): Promise<{ isValid: boolean; errors: Record<string, string>; values?: T }> {
  try {
    const validData = await schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
    return { isValid: true, errors: {}, values: validData };
  } catch (error) {
    const errors: Record<string, string> = {};
    if (error instanceof yup.ValidationError) {
      error.inner.forEach((e) => {
        if (e.path) {
          errors[e.path] = e.message;
        }
      });
    }
    return { isValid: false, errors };
  }
}

// Get validation error message
export function getValidationError(errors: Record<string, string>, field: string): string | undefined {
  return errors[field];
}

// Check if field has error
export function hasFieldError(errors: Record<string, string>, field: string): boolean {
  return !!errors[field];
}
