using ClassicRock.Api.Data;
using ClassicRock.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace ClassicRock.Api.Features.Genres;

public static class GenresEndpoints
{
    public static IEndpointRouteBuilder MapGenresEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/genres")
            .WithTags("Genres")
            .RequireRateLimiting("public");

        // =========
        // GET - Get All Genres
        // =========
        group.MapGet("/", async (AppDbContext db, CancellationToken ct) =>
        {
            var genres = await db.Genres
                .AsNoTracking()
                .OrderBy(x => x.Name)
                .Select(x => new GenreResponse(x.Id, x.Name))
                .ToListAsync(ct);
            
            return Results.Ok(genres);
        })
        .WithSummary("Get all genres")
        .WithDescription("Returns a lightweight list of all genres ordered by name.")
        .Produces<List<GenreResponse>>(StatusCodes.Status200OK);

        // =========
        // GET - Get Genre By Id
        // =========
        group.MapGet("/{id:guid}", async (Guid id, AppDbContext db, CancellationToken ct) =>
        {
            var genre = await db.Genres
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new GenreResponse(
                x.Id,
                x.Name
            ))
            .FirstOrDefaultAsync(ct);

            return genre is null ? Results.NotFound() : Results.Ok(genre);
        })
        .WithName("GetGenreById")
        .WithSummary("Get a genre by ID")
        .WithDescription("Returns a single genre by its unique identifier.")
        .Produces<GenreResponse>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);

        // =========
        // POST - Create New Genre
        // =========
        group.MapPost("/", async (CreateGenreRequest request, AppDbContext db, CancellationToken ct) =>
        {
            var validation = GenreValidator.ValidateForCreate(request);

            if (!validation.IsValid)
            {
                return Results.ValidationProblem(validation.Errors);
            }

            var normalizedName = request.Name.Trim();

            var exists = await db.Genres
                .AnyAsync(x => x.Name == normalizedName, ct);
            
            if (exists)
            {
                return Results.Conflict(new
                {
                    message = $"A genre named {normalizedName} already exists."
                });
            }

            var genre = new Genre
            {
                Id = Guid.NewGuid(),
                Name = normalizedName
            };

            db.Genres.Add(genre);
            await db.SaveChangesAsync(ct);

            var response = new GenreResponse(genre.Id, genre.Name);

            // Show the client where the newly created category can be fetched
            return Results.CreatedAtRoute(
                routeName: "GetGenreById",
                routeValues: new { id = genre.Id},
                value: response);
        })
        .WithSummary("Create a genre")
        .WithDescription("Creates a new genre. Genre names must be unique.")
        .Produces<GenreResponse>(StatusCodes.Status201Created)
        .ProducesValidationProblem()
        .Produces(StatusCodes.Status409Conflict);

        // =========
        // PUT - Update Genre by Id
        // =========
        group.MapPut("/{id:guid}", async (
            Guid id,
            UpdateGenreRequest request,
            AppDbContext db,
            CancellationToken ct
        ) =>
        {
            var validation = GenreValidator.ValidateForUpdate(request);
            if (!validation.IsValid)
            {
                return Results.ValidationProblem(validation.Errors);
            }

            // Check if the genre actually exists for the given ID
            var genre = await db.Genres.FirstOrDefaultAsync(x => x.Id == id, ct);

            if (genre is null)
            {
                return Results.NotFound();
            }

            var normalizedName = request.Name.Trim();
            // Check if another genre exists with the same name
            var duplicateExists = await db.Genres
                .AnyAsync(x => x.Id != id && x.Name == normalizedName, ct);

            if (duplicateExists)
            {
                return Results.Conflict(new
                {
                    message = $"A genre named {normalizedName} already exists."
                });
            }

            // Perform the update on the genre we've found in the DB
            genre.Name = normalizedName;

            await db.SaveChangesAsync(ct);

            return Results.Ok(new GenreResponse(genre.Id, genre.Name));
        })
        .WithSummary("Update a genre")
        .WithDescription("Updates the name of an existing genre. Genre names must remain unique.")
        .Produces<GenreResponse>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound)
        .ProducesValidationProblem()
        .Produces(StatusCodes.Status409Conflict);

        // =========
        // DELETE - Delete Genre By Id
        // =========
        group.MapDelete("/{id:guid}", async (
            Guid id,
            AppDbContext db,
            CancellationToken ct
        ) =>
        {
            // Fetch the genre by ID
            var genre = await db.Genres.FirstOrDefaultAsync(x => x.Id == id, ct);

            if (genre is null) return Results.NotFound();

            // Remove the genre
            db.Genres.Remove(genre);
            await db.SaveChangesAsync(ct);

            return Results.NoContent();
        })
        .WithSummary("Delete a genre")
        .WithDescription("Deletes a genre and removes its album/artist genre associations through configured cascade behavior.")
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status404NotFound);

        return app;
    }
}