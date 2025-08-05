// 🌐 API Configuration
const API_BASE_URL = "http://127.0.0.1:8000"

// ✅ API Helper Functions
class ProductAPI {
  // 📥 Request with JSON
  static async request(endpoint, options = {}) {
    try {
      console.log(`🔄 API Request: ${API_BASE_URL}${endpoint}`)
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log(`✅ API Response:`, data)
      return data
    } catch (error) {
      console.error(`❌ API Request failed for ${endpoint}:`, error)
      throw error
    }
  }

  // 📤 Request with FormData (for uploading images)
  static async requestFormData(endpoint, formData, method = "POST") {
    try {
      console.log(`🔄 API FormData Request: ${API_BASE_URL}${endpoint}`)
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: method,
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log(`✅ API FormData Response:`, data)
      return data
    } catch (error) {
      console.error(`❌ API FormData Request failed for ${endpoint}:`, error)
      throw error
    }
  }

  // ✅ Load all products - GET /products/
  static async loadProducts() {
    return await this.request("/products/")
  }

  // ✅ Get single product by ID - GET /products/{id}/
  static async getProduct(id) {
    return await this.request(`/products/${id}/`)
  }

  // ✅ Add new product (with image) - POST /products/add/
  static async addProduct(formData) {
    // ✅ formData لازم يحتوي: title, title_en, material, category, img, description_ar, description_en, price, color, dimensions, extra_details
    return await this.requestFormData("/products/add/", formData, "POST")
  }

 // ✅ Update existing product - PATCH /products/update/{id}/
static async updateProduct(id, formData) {
  try {
    console.log(`✏ Updating product: ${id}`)
    const response = await fetch(`${API_BASE_URL}/products/update/${id}/`, {
      method: "PATCH",   // ✅ PATCH هيشتغل دلوقتي
      body: formData
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`✅ Product updated successfully:`, data)
    return data
  } catch (error) {
    console.error(`❌ Failed to update product ${id}:`, error)
    throw error
  }
}
  

  // ✅ Delete product - DELETE /products/delete/{id}/
  static async deleteProduct(id) {
    try {
      console.log(`🗑 Deleting product: ${id}`)
      const response = await fetch(`${API_BASE_URL}/products/delete/${id}/`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      console.log(`✅ Product deleted successfully: ${id}`)
      return true
    } catch (error) {
      console.error(`❌ Failed to delete product ${id}:`, error)
      throw error
    }
  }

  // ✅ Filter products by material & category
  static async filterProducts(material, category) {
    let endpoint = "/products/"
    const params = new URLSearchParams()

    if (material && material !== "all") {
      params.append("material", material)
    }

    if (category && category !== "all") {
      params.append("category", category)
    }

    if (params.toString()) {
      endpoint += "?" + params.toString()
    }

    return await this.request(endpoint)
  }
}

// ✅ Make ProductAPI accessible globally
window.ProductAPI = ProductAPI

// ✅ Test API Connection
let apiCheckInProgress = false

async function testAPIConnection() {
  if (apiCheckInProgress) return false  // ✅ يمنع التكرار
  apiCheckInProgress = true

  try {
    console.log("🔄 Testing API connection once...")
    const products = await ProductAPI.loadProducts()
    console.log(`✅ API connection successful! Products loaded: ${products.length}`)
    return true
  } catch (error) {
    console.error("❌ API connection failed:", error)
    return false
  } finally {
    apiCheckInProgress = false
  }
}


window.testAPIConnection = testAPIConnection
