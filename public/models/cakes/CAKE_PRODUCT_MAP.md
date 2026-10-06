# Cake product to 3D model map

Generated from `manifest.json` (category=`cake`) and `catalog_product` in `pinkbakes_backend/db.sqlite3`.

- Cake models in manifest: **29**
- Catalog products: **21**
- Mapping entries: **21** (covers all products; some models shared)
- Distinct models used: **19**
- Unused cake models: **10**

## Mapping

| product_id | name | model_path |
|---|---|---|
| 1 | Chocolate Truffle Cake | `/models/cakes/tiny_treats/cake_chocolate.gltf` |
| 2 | Confetti Celebration Cake | `/models/cakes/poly_pizza/Isa_Lousberg_Cake_Birthday_JCT2SAoBud.glb` |
| 3 | Vanilla Dream Birthday Cake | `/models/cakes/poly_pizza/Isa_Lousberg_Cake_Birthday_Cut_BzSIf8WuEG.glb` |
| 4 | Rainbow Sprinkle Birthday Cake | `/models/cakes/poly_pizza/Isa_Lousberg_Cake_Birthday_Slice_YxYKsrZnwd.glb` |
| 5 | Chocolate Fudge Birthday Cake | `/models/cakes/kenney_food/cake-birthday.glb` |
| 6 | Rose Garden Anniversary Cake | `/models/cakes/tiny_treats/cake_strawberry_cut.gltf` |
| 7 | Golden Heart Anniversary Cake | `/models/cakes/kenney_food/cake.glb` |
| 8 | Classic Tiered Wedding Cake | `/models/cakes/poly_pizza/Polygonal_Mind_Cake_Character_gpZIDI2FVD.glb` |
| 9 | Floral Elegance Wedding Cake | `/models/cakes/poly_pizza/Isa_Lousberg_Cake_Strawberry_Slic_oV5ntwdWx0.glb` |
| 10 | Midnight Mocha Cake | `/models/cakes/tiny_treats/cake_chocolate_slice.gltf` |
| 11 | Belgian Dark Chocolate Cake | `/models/cakes/tiny_treats/cake_chocolate_cut.gltf` |
| 12 | Red Velvet Designer Cake | `/models/cakes/poly_pizza/Kenney_Cake_Birthday_38GEFBlOXw.glb` |
| 13 | Berry Bliss Designer Cake | `/models/cakes/poly_pizza/Isa_Lousberg_Cake_Strawberry_OJ0MYdSpn1.glb` |
| 14 | Unicorn Fantasy Cake | `/models/cakes/tiny_treats/cake_birthday.gltf` |
| 15 | Custom Photo Print Cake | `/models/cakes/poly_pizza/Kenney_Cake_KGFyP16ebH.glb` |
| 16 | Family Memory Photo Cake | `/models/cakes/tiny_treats/cake_birthday_cut.gltf` |
| 17 | Build-Your-Own Celebration Cake | `/models/cakes/tiny_treats/cake_birthday_slice.gltf` |
| 18 | Theme Party Custom Cake | `/models/cakes/tiny_treats/cake_strawberry_slice.gltf` |
| 19 | Eggless Butterscotch Delight | `/models/cakes/kenney_food/cake.glb` |
| 20 | Eggless Pineapple Cream Cake | `/models/cakes/tiny_treats/cake_strawberry.gltf` |
| 21 | Eggless Black Forest Cake | `/models/cakes/tiny_treats/cake_chocolate.gltf` |

## Unused cake models

| model | title | reason |
|---|---|---|
| `/models/cakes/kenney_food/cake-slicer.glb` | Cake Slicer | No catalog product for cupcake/pancake/tool |
| `/models/cakes/kenney_food/cupcake.glb` | Cupcake | No catalog product for cupcake/pancake/tool |
| `/models/cakes/kenney_food/pancakes.glb` | Pancakes | No catalog product for cupcake/pancake/tool |
| `/models/cakes/poly_pizza/Isa_Lousberg_Cupcake_jlt53I8KKE.glb` | Cupcake | No catalog product for cupcake/pancake/tool |
| `/models/cakes/poly_pizza/Kenney_Cupcake_txZDsDca1L.glb` | Cupcake | No catalog product for cupcake/pancake/tool |
| `/models/cakes/poly_pizza/Kenney_Pancakes_7ymlduImaC.glb` | Pancakes | No catalog product for cupcake/pancake/tool |
| `/models/cakes/poly_pizza/Polygonal_Mind_Pancake_Character_PhHVt07Tt7.glb` | Pancake Character | No catalog product for cupcake/pancake/tool |
| `/models/cakes/poly_pizza/Quaternius_Cupcake_XL70IUDIrZ.glb` | Cupcake | No catalog product for cupcake/pancake/tool |
| `/models/cakes/poly_pizza/Quaternius_Pancakes_Stack_rNr63sFa69.glb` | Pancakes Stack | No catalog product for cupcake/pancake/tool |
| `/models/cakes/tiny_treats/cupcake.gltf` | Cupcake | No catalog product for cupcake/pancake/tool |

## Unmapped products

None — all catalog products have a mapping entry.

## Notes

- Prefer `.glb` when a Poly Pizza / Kenney GLB exists for the same concept as a Tiny Treats `.gltf`.
- Chocolate assets exist only under Tiny Treats (`.gltf`); Black Forest shares the chocolate whole cake.
- Cupcakes, pancakes, and cake-slicer have no matching catalog SKUs — left unused.
- Photo/custom/eggless butterscotch and pineapple have weak visual matches (no dedicated assets).
