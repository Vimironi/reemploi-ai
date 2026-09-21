export async function onRequestPost(context) {
  try {
    const { results } = await context.env.DB.prepare(`
      SELECT *
      FROM materials
      WHERE status = 'new'
      ORDER BY id ASC
      LIMIT 10
    `).all();

    if (!results.length) {
      return Response.json({
        success: true,
        message: "Aucun nouveau matériau."
      });
    }

    for (const material of results) {
      await context.env.DB.prepare(`
        INSERT INTO analyses (
          material_id,
          status
        )
        VALUES (?, 'pending')
      `)
      .bind(material.id)
      .run();

      await context.env.DB.prepare(`
        UPDATE materials
        SET status = 'processing'
        WHERE id = ?
      `)
      .bind(material.id)
      .run();
    }

    return Response.json({
      success: true,
      processed: results.length
    });

  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Erreur agent." },
      { status: 500 }
    );
  }
}
