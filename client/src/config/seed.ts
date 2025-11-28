import { container } from '@/config/container';
import { User, Post, Farm, Plot, Plant, PlantRecord } from '@/models';
import { Product } from '@/models/Product';
import { Disease } from '@/models/Disease';
import { Group } from '@/models/Group';
import { STORE_NAMES } from '@/lib/database';

/**
 * Seed initial data for development and testing
 */
export async function seedDatabase(): Promise<void> {
  console.log('🌱 Checking if database needs seeding...');

  try {
    // Check if users already exist
    const existingUsers = await container.databaseProvider.getAll(STORE_NAMES.USERS);
    
    if (existingUsers.length > 0) {
      console.log('✅ Database already has data, skipping seed');
      return;
    }

    console.log('🌱 Seeding database with initial data...');

    // Seed demo users
    const users = [
      User.create({
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        password: 'password123',
        role: 'Agricultor',
        location: 'Valle del Cauca, Colombia',
        avatar: 'https://picsum.photos/seed/user1/200/200',
        bio: 'Agricultor con 15 años de experiencia en cultivos de café. Me apasiona la agricultura sostenible y las nuevas tecnologías.',
        crops: ['Café', 'Plátano', 'Aguacate'],
        interests: ['Agricultura Sostenible', 'Tecnología Agrícola', 'Control de Plagas'],
        experienceLevel: 'Avanzado',
        farmSize: '25 hectáreas',
        phone: '+57 310 123 4567',
        website: 'www.cafejuanperez.com',
      }),
      User.create({
        name: 'María García',
        email: 'maria.garcia@example.com',
        password: 'password123',
        role: 'Ingeniero',
        location: 'Antioquia, Colombia',
        avatar: 'https://picsum.photos/seed/user2/200/200',
        bio: 'Ingeniera agrónoma especializada en fertilización y manejo integrado de cultivos. Consultora independiente.',
        crops: ['Café', 'Cacao', 'Hortalizas'],
        interests: ['Fertilización', 'Agricultura Orgánica', 'Certificaciones'],
        experienceLevel: 'Experto',
        phone: '+57 311 234 5678',
      }),
      User.create({
        name: 'Carlos Rodríguez',
        email: 'carlos.rodriguez@example.com',
        password: 'password123',
        role: 'Proveedor',
        location: 'Cundinamarca, Colombia',
        avatar: 'https://picsum.photos/seed/user3/200/200',
        bio: 'Proveedor de semillas certificadas, herramientas y equipos agrícolas. Más de 10 años en el mercado.',
        interests: ['Comercialización', 'Tecnología Agrícola'],
        experienceLevel: 'Avanzado',
        phone: '+57 312 345 6789',
        website: 'www.agrocarlos.co',
      }),
    ];

    // Save users to database
    for (const user of users) {
      await container.databaseProvider.add(STORE_NAMES.USERS, user.toJSON());
    }

    console.log(`✅ Database seeded with ${users.length} users`);

    // Seed demo posts
    const posts = [
      Post.create({
        userId: users[0].id,
        author: users[0].name,
        authorAvatar: users[0].avatar,
        content: '¡Buenos días comunidad! 🌱☀️\n\nHoy comenzamos la cosecha de café en nuestra finca. Después de meses de cuidado, finalmente vemos los frutos. El clima ha sido perfecto este año.\n\n¿Cómo va su temporada de cosecha?\n\n#Café #Cosecha #AgriculturaColombiana',
        image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800',
        tags: ['Café', 'Cosecha', 'AgriculturaColombiana'],
      }),
      Post.create({
        userId: users[1].id,
        author: users[1].name,
        authorAvatar: users[1].avatar,
        content: '📚 Tip del día sobre fertilización:\n\nRecuerden que el análisis de suelo es fundamental antes de aplicar cualquier fertilizante. Muchos agricultores aplican sin saber qué necesita realmente su tierra.\n\n¡Un buen diagnóstico ahorra dinero y mejora resultados!\n\n#Fertilización #TipsAgrícolas',
        tags: ['Fertilización', 'TipsAgrícolas'],
      }),
      Post.create({
        userId: users[2].id,
        author: users[2].name,
        authorAvatar: users[2].avatar,
        content: '🚨 ¡Nuevos productos disponibles!\n\nAcabamos de recibir semillas certificadas de tomate cherry y pimentón. Excelente germinación garantizada.\n\nEscríbanme para más información. Envíos a todo el país. 🚛\n\n#Semillas #Proveedor',
        image: 'https://images.unsplash.com/photo-1592921870789-04563d55041c?w=800',
        tags: ['Semillas', 'Proveedor'],
      }),
      Post.create({
        userId: users[0].id,
        author: users[0].name,
        authorAvatar: users[0].avatar,
        content: 'Alguien ha tenido experiencia con la roya del café este año? 🍂\n\nHe notado algunas manchas en las hojas de algunas plantas y quiero actuar rápido antes de que se propague.\n\n¿Qué tratamiento recomiendan?',
        tags: ['Café', 'Plagas', 'Ayuda'],
      }),
    ];

    // Adjust timestamps for posts to appear in different times
    const now = Date.now();
    let postIndex = 0;
    for (const post of posts) {
      (post as { timestamp: string }).timestamp = new Date(now - (postIndex * 3600000 * 2)).toISOString();
      postIndex++;
    }

    // Save posts to database
    for (const post of posts) {
      await container.databaseProvider.add(STORE_NAMES.POSTS, post.toJSON());
    }

    console.log(`✅ Database seeded with ${posts.length} posts`);

    // Seed demo products
    const products = [
      Product.create({
        name: 'Semillas de Tomate Cherry',
        price: 25000,
        currency: 'COP',
        description: 'Semillas certificadas de tomate cherry. Alta germinación, resistentes a enfermedades. Paquete de 50 semillas.',
        category: 'Semillas',
        image: 'https://images.unsplash.com/photo-1592921870789-04563d55041c?w=400',
        sellerId: users[2].id,
        seller: users[2].name,
        stock: 100,
      }),
      Product.create({
        name: 'Fertilizante Orgánico Premium',
        price: 85000,
        currency: 'COP',
        description: 'Fertilizante 100% orgánico, ideal para todo tipo de cultivos. Mejora la estructura del suelo y aporta nutrientes esenciales. Presentación 25kg.',
        category: 'Fertilizantes',
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
        sellerId: users[2].id,
        seller: users[2].name,
        stock: 50,
      }),
      Product.create({
        name: 'Tijeras de Poda Profesional',
        price: 120000,
        currency: 'COP',
        description: 'Tijeras de poda de acero inoxidable con mango ergonómico. Corte preciso y limpio. Incluye funda protectora.',
        category: 'Herramientas',
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
        sellerId: users[2].id,
        seller: users[2].name,
        stock: 30,
      }),
      Product.create({
        name: 'Kit de Riego por Goteo',
        price: 350000,
        currency: 'COP',
        description: 'Sistema completo de riego por goteo para 100m². Incluye mangueras, conectores y goteros autocompensantes.',
        category: 'Equipos',
        image: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=400',
        sellerId: users[2].id,
        seller: users[2].name,
        stock: 15,
      }),
      Product.create({
        name: 'Semillas de Café Arábica',
        price: 45000,
        currency: 'COP',
        description: 'Semillas de café arábica variedad Castillo. Resistente a la roya. Ideal para altitudes de 1200-2000 msnm. Paquete de 100 semillas.',
        category: 'Semillas',
        image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400',
        sellerId: users[0].id,
        seller: users[0].name,
        stock: 80,
      }),
      Product.create({
        name: 'Machete Agrícola 18"',
        price: 65000,
        currency: 'COP',
        description: 'Machete de acero al carbono con mango de madera tratada. Hoja de 18 pulgadas, perfecto para desmalezar y cosechar.',
        category: 'Herramientas',
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
        sellerId: users[2].id,
        seller: users[2].name,
        stock: 45,
      }),
    ];

    // Save products to database
    for (const product of products) {
      await container.databaseProvider.add(STORE_NAMES.PRODUCTS, product.toJSON());
    }

    console.log(`✅ Database seeded with ${products.length} products`);

    // Seed diseases/pests for wiki
    const diseases = [
      Disease.create({
        name: 'Roya del Café',
        scientificName: 'Hemileia vastatrix',
        symptoms: [
          'Manchas amarillas en el haz de las hojas',
          'Polvillo naranja en el envés de las hojas',
          'Defoliación prematura',
          'Reducción de la producción',
          'Debilitamiento general de la planta'
        ],
        treatment: 'Aplicar fungicidas a base de cobre o triazoles. Realizar podas sanitarias eliminando hojas infectadas. Mantener buena ventilación en el cafetal. Aplicar cada 15-21 días durante época de lluvias.',
        plants: ['Café'],
        image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
        preventativeMeasures: [
          'Usar variedades resistentes como Castillo o Colombia',
          'Mantener sombra regulada (30-50%)',
          'Fertilización balanceada',
          'Eliminar plantas muy afectadas',
          'Monitoreo constante especialmente en época lluviosa'
        ],
        severity: 'Alta'
      }),
      Disease.create({
        name: 'Broca del Café',
        scientificName: 'Hypothenemus hampei',
        symptoms: [
          'Pequeños orificios en los granos de café',
          'Presencia de polvo en la entrada del orificio',
          'Granos perforados y dañados',
          'Caída prematura de frutos',
          'Pérdida de calidad del grano'
        ],
        treatment: 'Control biológico con Beauveria bassiana. Trampas con atrayentes. Recolección oportuna de frutos maduros. En casos severos, aplicar insecticidas específicos.',
        plants: ['Café'],
        image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400',
        preventativeMeasures: [
          'Recolectar todos los frutos sin dejar residuos',
          'Re-Re (Recolectar y Repasar)',
          'Mantener limpio el cafetal',
          'Instalar trampas de monitoreo',
          'Cosecha oportuna'
        ],
        severity: 'Alta'
      }),
      Disease.create({
        name: 'Tizón Tardío',
        scientificName: 'Phytophthora infestans',
        symptoms: [
          'Manchas oscuras en hojas que se expanden rápidamente',
          'Lesiones acuosas en tallos',
          'Pudrición de frutos',
          'Olor característico a descomposición',
          'Micelio blanco en condiciones húmedas'
        ],
        treatment: 'Aplicar fungicidas preventivos como mancozeb o clorotalonil. En caso de infección, usar fungicidas sistémicos. Eliminar plantas muy afectadas.',
        plants: ['Tomate', 'Papa', 'Pimentón'],
        image: 'https://images.unsplash.com/photo-1592921870789-04563d55041c?w=400',
        preventativeMeasures: [
          'Usar semillas certificadas',
          'Rotación de cultivos',
          'Evitar riego por aspersión',
          'Mantener buena ventilación',
          'No trabajar en el cultivo cuando está húmedo'
        ],
        severity: 'Alta'
      }),
      Disease.create({
        name: 'Mosca Blanca',
        scientificName: 'Bemisia tabaci',
        symptoms: [
          'Hojas amarillentas y debilitadas',
          'Presencia de insectos blancos en el envés',
          'Fumagina (hollín negro) en hojas',
          'Enrollamiento de hojas',
          'Transmisión de virus'
        ],
        treatment: 'Control biológico con Encarsia formosa. Aplicar jabón potásico o aceite de neem. En infestaciones severas, usar insecticidas específicos.',
        plants: ['Tomate', 'Pimentón', 'Pepino', 'Frijol', 'Yuca'],
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
        preventativeMeasures: [
          'Usar mallas antiinsectos',
          'Trampas amarillas pegajosas',
          'Eliminar malezas hospederas',
          'Rotación de cultivos',
          'Evitar exceso de nitrógeno'
        ],
        severity: 'Media'
      }),
      Disease.create({
        name: 'Sigatoka Negra',
        scientificName: 'Mycosphaerella fijiensis',
        symptoms: [
          'Manchas alargadas marrón oscuro en hojas',
          'Secamiento prematuro de hojas',
          'Reducción del área fotosintética',
          'Maduración prematura de frutos',
          'Racimos pequeños'
        ],
        treatment: 'Aplicar fungicidas sistémicos y protectores en rotación. Deshoje sanitario cada 15 días. Mantener buen drenaje.',
        plants: ['Banano', 'Plátano'],
        image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400',
        preventativeMeasures: [
          'Deshoje sanitario regular',
          'Buen manejo de drenaje',
          'Densidad de siembra adecuada',
          'Control de malezas',
          'Fertilización equilibrada'
        ],
        severity: 'Alta'
      }),
      Disease.create({
        name: 'Antracnosis',
        scientificName: 'Colletotrichum spp.',
        symptoms: [
          'Manchas oscuras hundidas en frutos',
          'Lesiones en hojas con bordes definidos',
          'Pudrición de frutos en postcosecha',
          'Secamiento de ramas',
          'Caída de flores'
        ],
        treatment: 'Aplicar fungicidas a base de cobre o mancozeb. Podar partes afectadas. Mejorar ventilación del cultivo.',
        plants: ['Aguacate', 'Mango', 'Papaya', 'Cítricos', 'Frijol'],
        image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400',
        preventativeMeasures: [
          'Usar material de siembra sano',
          'Evitar heridas en frutos',
          'Cosechar en tiempo seco',
          'Manejo adecuado postcosecha',
          'Podas de aireación'
        ],
        severity: 'Media'
      }),
      Disease.create({
        name: 'Trips',
        scientificName: 'Frankliniella occidentalis',
        symptoms: [
          'Hojas con manchas plateadas',
          'Deformación de hojas nuevas',
          'Cicatrices en frutos',
          'Flores dañadas y caídas',
          'Transmisión de virus'
        ],
        treatment: 'Control biológico con Orius spp. Aplicar spinosad o abamectina. Usar trampas azules pegajosas.',
        plants: ['Tomate', 'Pimentón', 'Cebolla', 'Flores', 'Fresa'],
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
        preventativeMeasures: [
          'Eliminar residuos de cosecha',
          'Usar mallas en invernaderos',
          'Monitoreo con trampas azules',
          'Control de malezas',
          'Evitar exceso de nitrógeno'
        ],
        severity: 'Media'
      }),
      Disease.create({
        name: 'Mildiu Velloso',
        scientificName: 'Peronospora spp.',
        symptoms: [
          'Manchas amarillas en el haz de hojas',
          'Pelusa grisácea en el envés',
          'Hojas que se secan desde los bordes',
          'Defoliación severa',
          'Reducción del rendimiento'
        ],
        treatment: 'Aplicar fungicidas como metalaxil o fosetil-aluminio. Mejorar ventilación. Evitar mojar el follaje.',
        plants: ['Cebolla', 'Lechuga', 'Espinaca', 'Vid', 'Pepino'],
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
        preventativeMeasures: [
          'Usar variedades resistentes',
          'Rotación de cultivos',
          'Riego por goteo',
          'Densidad de siembra adecuada',
          'Eliminar plantas enfermas'
        ],
        severity: 'Media'
      }),
    ];

    // Save diseases to database
    for (const disease of diseases) {
      await container.databaseProvider.add(STORE_NAMES.DISEASES, disease.toJSON());
    }

    console.log(`✅ Database seeded with ${diseases.length} diseases`);

    // Seed demo groups
    const groups = [
      Group.create({
        name: 'Caficultores de Colombia',
        description: 'Comunidad de productores de café colombiano. Compartimos experiencias, técnicas de cultivo y novedades del mercado.',
        image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400',
        adminId: users[0].id,
      }),
      Group.create({
        name: 'Agricultura Orgánica',
        description: 'Grupo dedicado a compartir prácticas de agricultura orgánica, certificaciones y mercados especializados.',
        image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400',
        adminId: users[1].id,
      }),
      Group.create({
        name: 'Tecnología para el Campo',
        description: 'Exploramos las últimas tecnologías aplicadas a la agricultura: drones, sensores IoT, agricultura de precisión.',
        image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
        adminId: users[2].id,
      }),
      Group.create({
        name: 'Control de Plagas',
        description: 'Grupo de apoyo para identificar y controlar plagas. Compartimos soluciones naturales y químicas.',
        image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
        adminId: users[0].id,
      }),
      Group.create({
        name: 'Productores de Cacao',
        description: 'Red de cacaoteros colombianos. Discutimos variedades, fermentación, secado y comercialización.',
        image: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400',
        adminId: users[1].id,
      }),
      Group.create({
        name: 'Mercados y Comercialización',
        description: 'Estrategias de venta directa, exportación, ferias agrícolas y canales de distribución.',
        image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400',
        adminId: users[2].id,
      }),
    ];

    // Actualizar categorías de los grupos
    groups[0].category = 'Cultivos';
    groups[1].category = 'Sostenibilidad';
    groups[2].category = 'Tecnología';
    groups[3].category = 'Plagas';
    groups[4].category = 'Cultivos';
    groups[5].category = 'Comercio';

    // Agregar algunos miembros a los grupos
    groups[0].addMember(users[1].id);
    groups[0].addMember(users[2].id);
    groups[1].addMember(users[0].id);
    groups[2].addMember(users[0].id);
    groups[2].addMember(users[1].id);

    // Save groups to database
    for (const group of groups) {
      await container.databaseProvider.add(STORE_NAMES.GROUPS, group.toJSON());
    }

    console.log(`✅ Database seeded with ${groups.length} groups`);

    // Seed demo farms, plots, and plants for Juan Pérez (first user)
    const userId = users[0].id;

    const farm = Farm.create({
      userId,
      name: 'Finca La Esperanza',
      location: 'Valle del Cauca, Colombia',
      totalArea: '25 hectáreas',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400',
    });

    await container.databaseProvider.add(STORE_NAMES.FARMS, farm.toJSON());

    // Create plots
    const plots = [
      Plot.create({
        farmId: farm.id,
        userId,
        name: 'Lote Café Principal',
        cropType: 'Café',
        rows: 5,
        columns: 6,
        position: { x: 0, y: 0, width: 60, height: 50 },
      }),
      Plot.create({
        farmId: farm.id,
        userId,
        name: 'Lote Plátano',
        cropType: 'Plátano',
        rows: 4,
        columns: 5,
        position: { x: 65, y: 0, width: 50, height: 40 },
      }),
    ];

    for (const plot of plots) {
      await container.databaseProvider.add(STORE_NAMES.PLOTS, plot.toJSON());
    }

    // Create plants for coffee plot (5x6 = 30 plants)
    const coffeeStatuses: Array<{ status: 'Saludable' | 'Observación' | 'Enfermo' | 'Recuperándose'; disease?: { id: string; name: string } }> = [
      { status: 'Saludable' }, { status: 'Saludable' }, { status: 'Saludable' }, { status: 'Enfermo', disease: { id: 'roya', name: 'Roya del Café' } }, { status: 'Saludable' }, { status: 'Saludable' },
      { status: 'Saludable' }, { status: 'Observación' }, { status: 'Enfermo', disease: { id: 'roya', name: 'Roya del Café' } }, { status: 'Enfermo', disease: { id: 'roya', name: 'Roya del Café' } }, { status: 'Observación' }, { status: 'Saludable' },
      { status: 'Saludable' }, { status: 'Observación' }, { status: 'Recuperándose' }, { status: 'Enfermo', disease: { id: 'roya', name: 'Roya del Café' } }, { status: 'Saludable' }, { status: 'Saludable' },
      { status: 'Saludable' }, { status: 'Saludable' }, { status: 'Saludable' }, { status: 'Observación' }, { status: 'Saludable' }, { status: 'Saludable' },
      { status: 'Saludable' }, { status: 'Saludable' }, { status: 'Saludable' }, { status: 'Saludable' }, { status: 'Saludable' }, { status: 'Saludable' },
    ];

    let plantIndex = 0;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 6; col++) {
        const config = coffeeStatuses[plantIndex];
        const plant = Plant.create({
          plotId: plots[0].id,
          userId,
          name: `Café ${row + 1}-${col + 1}`,
          type: 'Café',
          variety: 'Castillo',
          plantedDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 meses atrás
          position: { row, column: col },
        });
        plant.status = config.status;
        if (config.disease) {
          plant.currentDisease = config.disease;
        }
        await container.databaseProvider.add(STORE_NAMES.PLANTS, plant.toJSON());

        // Add some records for sick plants
        if (config.status === 'Enfermo' || config.status === 'Recuperándose') {
          const record = PlantRecord.createDiagnosis(
            plant.id,
            userId,
            {
              diseaseName: 'Roya del Café',
              scientificName: 'Hemileia vastatrix',
              confidence: 0.89,
              severity: 'high',
              description: 'Infección por roya detectada en las hojas.',
              symptoms: ['Manchas amarillas', 'Polvillo naranja'],
              treatment: ['Aplicar fungicida a base de cobre'],
              prevention: ['Usar variedades resistentes'],
              analyzedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            }
          );
          await container.databaseProvider.add(STORE_NAMES.PLANT_RECORDS, record.toJSON());
        }

        plantIndex++;
      }
    }

    // Create plants for plantain plot (4x5 = 20 plants, mostly healthy)
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 5; col++) {
        const isHealthy = Math.random() > 0.1; // 90% healthy
        const plant = Plant.create({
          plotId: plots[1].id,
          userId,
          name: `Plátano ${row + 1}-${col + 1}`,
          type: 'Plátano',
          variety: 'Hartón',
          plantedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 3 meses atrás
          position: { row, column: col },
        });
        plant.status = isHealthy ? 'Saludable' : 'Observación';
        await container.databaseProvider.add(STORE_NAMES.PLANTS, plant.toJSON());
      }
    }

    console.log(`✅ Database seeded with 1 farm, ${plots.length} plots, and 50 plants`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}
