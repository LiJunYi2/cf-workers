## Cloudflare 的 KV 管理

```javascript
const KV_MAP = {
    'kv1': ' 该值就是当前 workers 绑定的KV名称'
    // kv1 就是页面下拉框的值
    // 可以添加更多 KV 映射
  };
```
![kv](https://github.com/user-attachments/assets/14ca420d-dabb-4eee-a035-099ccb484545)


```html
<select id="kvSelect" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
    <option value="">请选择 KV</option>
    // value值对应KV_MAP中的 key
    <option value="kv1">KV 存储1</option>
</select>
```

## 效果图

<img width="1510" alt="image" src="https://github.com/user-attachments/assets/5c0fa312-8cfc-473f-9fc6-2ff9e8596101" />


## 博客
[Cloudflare KV管理工具](https://blog.bilivo.us.kg/article/cf-3)
