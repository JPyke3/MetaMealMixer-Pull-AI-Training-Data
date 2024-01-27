import fs from 'fs';

// Read in recipes.json and convert to object
const recipes = fs.readFileSync('recipes.json', 'utf8');
const recipesObject = JSON.parse(recipes);

const trainingFile = [];

const functions = [
	{
		"name": "generateRecipe",
		"description": "Generates a recipe with a name, method, list of ingredients with quantities, and cooking time.",
		"parameters": {
			"type": "object",
			"properties": {
				"name": {
					"type": "string",
					"description": "A very creative name for the recipe, something a reader wouldn't expect. Limited to 30 characters"
				},
				"ingredients": {
					"type": "array",
					"items": {
						"type": "object",
						"description": "Represents a single ingredient, specifying its name, quantity, and unit of measurement.",
						"properties": {
							"ingredient": {
								"type": "string",
								"description": "The name exactly as it appeared in the ingredient list."
							},
							"quantity": {
								"type": "number",
								"description": "The quantity of the ingredient required. Always use short notation such a g, kg, ml, etc. Round up to the nearest 5 if using grams."
							},
							"unit": {
								"type": "string",
								"description": "The unit of measurement for the quantity, such as 'grams', 'pieces', etc.",
								"enum": ["g", "piece(s)", "pinch"]
							}
						},
						"required": ["ingredient", "quantity", "unit"]
					},
					"description": "An array of ingredients for the recipe."
				},
				"method": {
					"type": "array",
					"items": {
						"type": "string",
						"description": "A step in the method to prepare the recipe."
					},
					"description": "The method to prepare the recipe, represented as an array of steps."
				},
				"cookingTime": {
					"type": "number",
					"description": "The time it takes to cook the recipe, in minutes."
				},
				"imagePrompt": {
					"type": "string",
					"description": "A prompt that can be passed to DALL-E to generate an accurate image of the recipe, ensure to include all the ingredients on the image."
				}
			},
			"required": ["name", "ingredients", "method", "cookingTime", "imagePrompt"]
		}
	}
];


for (const recipe of recipesObject) {
	trainingFile.push({
		"functions": functions,
		"messages": [
			{
				role: "system",
				content: "You are an AI that writes recipes from provided ingredients that follow the Metabolic Balance Principles."
			},
			{
				role: "user",
				content: recipe.originalPrompt
			},
			{
				role: "assistant",
				function_call: {
					name: "generateRecipe",
					arguments: JSON.stringify({
						name: recipe.name,
						ingredients: recipe.ingredients,
						method: recipe.method,
						cookingTime: recipe.cookingTime,
						imagePrompt: recipe.imagePrompt
					})
				}
			}
		]
	});
}

const result = "[\n" + trainingFile.map(e => '  ' + JSON.stringify(e)).join(',\n') + "\n]";
fs.writeFileSync('training.json', result);

