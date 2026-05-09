
export function mapCockroachProperty(p: any) {
    // Parse price string to number
    let priceNum = 0;
    if (p.precio) {
        const cleaned = String(p.precio).replace(/[^0-9.,]/g, '').replace(',', '.');
        priceNum = parseFloat(cleaned) || 0;
    }

    // Multimedia handling
    let images: string[] = [];
    try {
        const rawMultimedia = p.multimedia || p.imagenes || [];
        const parsed = typeof rawMultimedia === 'string' ? JSON.parse(rawMultimedia) : rawMultimedia;
        if (Array.isArray(parsed)) {
            images = parsed.filter((u: any) => u && typeof u === 'string' && u.startsWith('http'));
        } else if (typeof parsed === 'object' && parsed !== null) {
            images = Object.values(parsed).filter((u: any) => typeof u === 'string' && u.startsWith('http')) as string[];
        }
    } catch { /* ignore */ }

    const primaryImage = images[0] || "/luxury_modern_villa_renaissance.png";

    return {
        id: String(p.id),
        title: p.titulo_profesional || p.nombre_proyecto || "Propiedad Novo Heritage",
        location: p.zona || "República Dominicana",
        address: p.zona || "Ubicación Premium",
        status: 'available',
        price: priceNum,
        priceLabel: p.precio || 'Consultar',
        type: "propiedad",
        bedrooms: parseInt(p.habitaciones || 3),
        bathrooms: parseInt(p.banos || 2),
        area: parseFloat(p.area_m2 || 150),
        sqft: Math.round(parseFloat(p.area_m2 || 150) * 10.764),
        yearBuilt: new Date().getFullYear(),
        description: p.descripcion_limpia || "Propiedad gestionada por Novo Heritage Group.",
        features: p.es_constructora_oficial ? ["Constructora Oficial", "Proyecto Verificado"] : ["Novo Exclusive"],
        agent: {
            name: 'Novo Heritage Real Estate',
            phone: '+1 849-220-0224',
        },
        image: primaryImage,
        images: images.length > 0 ? images : [primaryImage],
        reference: `NH-${String(p.id).padStart(4, '0')}`,
        featured: p.es_constructora_oficial === true,
        city: p.city || p.zona || 'Santo Domingo',
        sector: p.sector || p.zona || 'N/A',
        garage: parseInt(p.parqueos || 0),
        amenities: [],
        transactionType: 'venta',
        isOfficial: p.es_constructora_oficial,
        subtitle: p.nombre_proyecto || '',
    };
}
