-- Script de recetas de ejemplo
-- Requiere que seed-ingredients-full.sql ya haya sido ejecutado
-- idUsuario = 1 (admin)

INSERT INTO recipe ("nombre", "descripcion", "calorias", "tiempoPreparacion", "imagen_url", "idUsuario") VALUES
('Milanesa Napolitana', 'Clásica milanesa de carne rebozada con salsa de tomate, jamón y mozzarella gratinada', 850, 45, 'https://images.pexels.com/photos/29042351/pexels-photo-29042351.jpeg', 1),
('Arroz con Pollo', 'Arroz cremoso cocinado con trozos de pollo, morrón y caldo casero', 620, 50, 'https://images.pexels.com/photos/21821573/pexels-photo-21821573.jpeg', 1),
('Fideos a la Bolognesa', 'Spaghetti con salsa bolognesa de carne picada y tomates frescos', 680, 40, 'https://images.pexels.com/photos/33428055/pexels-photo-33428055.jpeg', 1),
('Locro', 'Guiso tradicional argentino con carne de cerdo, chorizo y porotos blancos', 920, 180, 'https://images.pexels.com/photos/13788766/pexels-photo-13788766.jpeg', 1),
('Pollo al Horno con Papas', 'Muslos de pollo jugosos al horno con papas doradas y hierbas', 700, 75, 'https://images.pexels.com/photos/36939708/pexels-photo-36939708.jpeg', 1),
('Osobuco al Vino Tinto', 'Osobuco braseado lentamente con vino tinto, cebolla y zanahorias', 780, 150, 'https://images.pexels.com/photos/19606035/pexels-photo-19606035.jpeg', 1),
('Guiso de Lentejas', 'Guiso reconfortante de lentejas con chorizo, cebolla y pimentón', 540, 60, 'https://images.pexels.com/photos/33323278/pexels-photo-33323278.jpeg', 1),
('Tortilla de Papa', 'Tortilla española con papas y cebolla, jugosa por dentro y dorada por fuera', 480, 35, 'https://images.pexels.com/photos/17714359/pexels-photo-17714359.jpeg', 1),
('Pasta Carbonara', 'Penne con salsa cremosa de panceta, huevo y parmesano', 750, 30, 'https://images.pexels.com/photos/3606799/pexels-photo-3606799.jpeg', 1),
('Alfajores de Maicena', 'Tiernos alfajores rellenos de dulce de leche y rebozados en coco', 380, 60, 'https://images.pexels.com/photos/17358380/pexels-photo-17358380.jpeg', 1);

-- recipe_ingredients para Milanesa Napolitana (id = 1)
INSERT INTO recipe_ingredients ("receta_id", "ingrediente_id", "cantidad") VALUES
(1, 3, 200),
(1, 156, 50),
(1, 322, 2),
(1, 27, 80),
(1, 256, 100),
(1, 143, 60),
(1, 128, 80),
(1, 134, 30),
(1, 177, 5),
(1, 22, 2);

-- recipe_ingredients para Arroz con Pollo (id = 2)
INSERT INTO recipe_ingredients ("receta_id", "ingrediente_id", "cantidad") VALUES
(2, 1, 400),
(2, 168, 200),
(2, 165, 100),
(2, 137, 120),
(2, 50, 500),
(2, 135, 30),
(2, 177, 5),
(2, 142, 5),
(2, 55, 150);

-- recipe_ingredients para Fideos a la Bolognesa (id = 3)
INSERT INTO recipe_ingredients ("receta_id", "ingrediente_id", "cantidad") VALUES
(3, 187, 350),
(3, 113, 300),
(3, 55, 400),
(3, 137, 100),
(3, 135, 30),
(3, 166, 100),
(3, 177, 5),
(3, 22, 2),
(3, 140, 3),
(3, 144, 50);

-- recipe_ingredients para Locro (id = 4)
INSERT INTO recipe_ingredients ("receta_id", "ingrediente_id", "cantidad") VALUES
(4, 4, 300),
(4, 56, 200),
(4, 35, 250),
(4, 137, 150),
(4, 165, 100),
(4, 20, 800),
(4, 142, 10),
(4, 72, 5),
(4, 177, 10),
(4, 22, 3);

-- recipe_ingredients para Pollo al Horno con Papas (id = 5)
INSERT INTO recipe_ingredients ("receta_id", "ingrediente_id", "cantidad") VALUES
(5, 401, 600),
(5, 89, 500),
(5, 135, 40),
(5, 177, 8),
(5, 22, 3),
(5, 140, 5),
(5, 142, 5),
(5, 115, 1);

-- recipe_ingredients para Osobuco al Vino Tinto (id = 6)
INSERT INTO recipe_ingredients ("receta_id", "ingrediente_id", "cantidad") VALUES
(6, 18, 800),
(6, 166, 250),
(6, 20, 400),
(6, 137, 150),
(6, 37, 100),
(6, 55, 200),
(6, 135, 30),
(6, 177, 8),
(6, 22, 3),
(6, 16, 2);

-- recipe_ingredients para Guiso de Lentejas (id = 7)
INSERT INTO recipe_ingredients ("receta_id", "ingrediente_id", "cantidad") VALUES
(7, 29, 300),
(7, 56, 150),
(7, 137, 120),
(7, 55, 200),
(7, 165, 80),
(7, 20, 600),
(7, 142, 8),
(7, 72, 3),
(7, 177, 6),
(7, 134, 20);

-- recipe_ingredients para Tortilla de Papa (id = 8)
INSERT INTO recipe_ingredients ("receta_id", "ingrediente_id", "cantidad") VALUES
(8, 89, 400),
(8, 322, 6),
(8, 137, 100),
(8, 135, 50),
(8, 177, 5),
(8, 22, 2);

-- recipe_ingredients para Pasta Carbonara (id = 9)
INSERT INTO recipe_ingredients ("receta_id", "ingrediente_id", "cantidad") VALUES
(9, 152, 350),
(9, 10, 150),
(9, 322, 3),
(9, 144, 80),
(9, 69, 100),
(9, 177, 5),
(9, 22, 3);

-- recipe_ingredients para Alfajores de Maicena (id = 10)
INSERT INTO recipe_ingredients ("receta_id", "ingrediente_id", "cantidad") VALUES
(10, 156, 150),
(10, 68, 150),
(10, 32, 200),
(10, 39, 80),
(10, 322, 2),
(10, 205, 5),
(10, 11, 5),
(10, 409, 300);
