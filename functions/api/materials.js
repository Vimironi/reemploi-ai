export async function onRequestPost(context) {
  try {
    const data = await context.request.json();

    const required = [
      "company",
      "email",
      "material",
      "quantity",
      "location"
    ];

    for (const field of required) {
      if (!data[field] || !String(data[field]).trim()) {
        return Response.json(
          { error: `Champ manquant : ${field}` },
          { status: 400 }
        );
      }
    }

    const email = String(data.email).trim();

    if (!email.includes("@")) {
      return Response.json(
        { error: "Adresse email invalide" },
        { status: 400 }
      );
    }

    const result = await context.env.DB.prepare(`
      INSERT INTO materials
      (
        company,
        email,
        material,
        quantity,
        location,
        available,
        description
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
      .bind(
        String(data.company).trim(),
        email,
        String(data.material).trim(),
        String(data.quantity).trim(),
        String(data.location).trim(),
        data.available || null,
        data.description || null
      )
      .run();

    return Response.json({
      success: true,
      id: result.meta.last_row_id
    });

  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: "Impossible d'enregistrer le lot."
      },
      { status: 500 }
    );
  }
}
