import { AuthService } from "../modules/auth/auth.service.js"
import { connectDB } from "../db/index.db.js"
import { ServiceCategoryModel } from "../modules/service-category/service-category.model.js"
import mongoose from "mongoose"
import fs from "fs"
import path from "path"

// MongoDB Atlas connection string
const MONGO_URI = "mongodb+srv://mohitk1595:password0976431@aarce-cluster.rxe38.mongodb.net/gharseva?appName=aarce-cluster"

/**
 * Create service providers from JSON file
 * 
 * Usage: node scripts/create-provider.js --file=providers.json
 * 
 * JSON format (use category slug, script will match to ID):
 * {
 *   "providers": [
 *     {
 *       "email": "provider@email.com",
 *       "password": "Password123",
 *       "firstName": "John",
 *       "lastName": "Doe",
 *       "category": "plumbing",  <-- use slug here
 *       "city": "Mumbai",
 *       "area": "Andheri",
 *       "pincode": "400001",
 *       "basePrice": 500,
 *       "experience": 5,
 *       "avatar": "https://cloudinary-url.com/avatar.jpg",
 *       "description": "Your description here"
 *     }
 *   ]
 * }
 */
async function createProviders(args) {
    let categoriesMap = new Map()

    try {
        await connectDB.connect()
        console.log("📡 Database connected successfully\n")

        // Fetch all service categories
        console.log("📂 Loading service categories...")
        const categories = await ServiceCategoryModel.find({ isActive: true }).select('name slug').lean()

        if (!categories || categories.length === 0) {
            console.error("❌ No service categories found in database!")
            process.exit(1)
        }

        // Create slug -> ID map
        categories.forEach(cat => {
            categoriesMap.set(cat.slug, cat._id.toString())
        })

        console.log(`✅ Found ${categories.length} service categories:\n`)
        categories.forEach(cat => {
            console.log(`  • ${cat.slug} → ${cat._id}`)
        })
        console.log("")

        // Get file path from args
        const filePath = args.file || args.f
        if (!filePath) {
            console.error("❌ Missing --file parameter")
            console.log("\n📝 Usage:")
            console.log('node scripts/create-provider.js --file=providers.json')
            console.log("\n📄 JSON format (use category slug):")
            console.log(`{
  "providers": [
    {
      "email": "provider@email.com",
      "password": "Password123",
      "firstName": "John",
      "lastName": "Doe",
      "category": "plumbing",
      "city": "Mumbai",
      "area": "Andheri",
      "pincode": "400001",
      "basePrice": 500,
      "experience": 5,
      "avatar": "https://cloudinary-url.com/avatar.jpg",
      "description": "Your description here"
    }
  ]
}`)
            console.log("\n📋 Available category slugs:", Array.from(categoriesMap.keys()).join(', '))
            process.exit(1)
        }

        // Read and parse JSON file
        const fullPath = path.resolve(filePath)
        if (!fs.existsSync(fullPath)) {
            console.error("❌ File not found:", fullPath)
            process.exit(1)
        }

        const fileContent = fs.readFileSync(fullPath, 'utf-8')
        const jsonData = JSON.parse(fileContent)

        // Handle nested array format: { "providers": [[{...}, {...}]] }
        let providers = jsonData.providers
        
        // If providers is an array containing another array, extract the inner array
        if (providers && Array.isArray(providers) && providers.length > 0) {
            if (Array.isArray(providers[0])) {
                providers = providers[0]
            }
        }

        if (!providers || !Array.isArray(providers) || providers.length === 0) {
            console.error("❌ No providers found in JSON. Expected format: { \"providers\": [...] }")
            process.exit(1)
        }

        console.log(`📋 Found ${providers.length} provider(s) to create\n`)
        console.log("─".repeat(60))

        const results = {
            success: [],
            failed: []
        }

        for (let i = 0; i < providers.length; i++) {
            const p = providers[i]
            console.log(`\n🔄 Creating provider ${i + 1}/${providers.length}: ${p.email}`)

            try {
                // Validate required fields
                const requiredFields = ['email', 'password', 'firstName', 'lastName', 'category', 'city', 'area', 'pincode', 'basePrice', 'experience', 'avatar', 'description']
                const missingFields = requiredFields.filter(field => !p[field])

                if (missingFields.length > 0) {
                    throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
                }

                // Match category slug to ID
                const categorySlug = p.category.toLowerCase().trim()
                const categoryId = categoriesMap.get(categorySlug)

                if (!categoryId) {
                    throw new Error(`Invalid category slug: "${p.category}". Available: ${Array.from(categoriesMap.keys()).join(', ')}`)
                }

                console.log(`  📂 Category matched: "${categorySlug}" → ${categoryId}`)

                // Prepare provider data
                const providerData = {
                    email: p.email,
                    password: p.password,
                    first_name: p.firstName,
                    last_name: p.lastName,
                    category_id: categoryId,
                    city: p.city,
                    area: p.area,
                    pincode: p.pincode,
                    base_price: parseInt(p.basePrice),
                    experience: parseInt(p.experience),
                    avatar: p.avatar,
                    description: p.description
                }

                const result = await AuthService.registerProvider(providerData)

                console.log(`  ✅ Success!`)
                console.log(`  👤 User ID: ${result.user._id}`)
                console.log(`  📧 Email: ${result.user.email}`)
                console.log(`  🏢 Profile ID: ${result.profile._id}`)

                results.success.push({
                    email: p.email,
                    userId: result.user._id,
                    profileId: result.profile._id
                })

            } catch (error) {
                console.error(`  ❌ Failed: ${error.message}`)
                results.failed.push({
                    email: p.email,
                    error: error.message
                })
            }
        }

        // Summary
        console.log("\n" + "─".repeat(60))
        console.log("📊 SUMMARY")
        console.log("─".repeat(60))
        console.log(`✅ Successful: ${results.success.length}`)
        console.log(`❌ Failed: ${results.failed.length}`)

        if (results.success.length > 0) {
            console.log("\n📋 Created Providers:")
            results.success.forEach((s, i) => {
                console.log(`  ${i + 1}. ${s.email} (ID: ${s.userId})`)
            })
        }

        if (results.failed.length > 0) {
            console.log("\n⚠️ Failed Providers:")
            results.failed.forEach((f, i) => {
                console.log(`  ${i + 1}. ${f.email} - ${f.error}`)
            })
        }

    } catch (error) {
        console.error("❌ Error:", error.message)
    } finally {
        await mongoose.connection.close()
        console.log("\n🔌 Database connection closed.")
        process.exit(0)
    }
}

// Parse command line arguments
function parseArguments() {
    const args = process.argv.slice(2)
    const parsed = {}

    args.forEach(arg => {
        if (arg.startsWith('--')) {
            const [key, value] = arg.substring(2).split('=')
            if (key && value) {
                parsed[key] = value
            }
        } else if (arg.startsWith('-')) {
            const key = arg.substring(1)
            parsed[key] = true
        }
    })

    return parsed
}

// Run the script
const args = parseArguments()
createProviders(args)
