using Howestprime.Movies.Domain.MovieEvents;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Howestprime.Movies.Infrastructure.Persistence.EntityFramework.Configuration.Domain;

public class MovieEventConfiguration : IEntityTypeConfiguration<MovieEvent>
{
    public void Configure(EntityTypeBuilder<MovieEvent> builder)
    {
        builder.ToTable("MovieEvents");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).ValueGeneratedNever();
        builder.Property(e => e.MovieId).IsRequired();
        builder.Property(e => e.RoomId).IsRequired();
        builder.Property(e => e.Showtime).IsRequired();
        builder.Property(e => e.Visitors).IsRequired().HasDefaultValue(0);

        builder.OwnsMany(e => e.Bookings, bookingBuilder =>
        {
            bookingBuilder.ToTable("Bookings");
            bookingBuilder.HasKey(b => b.Id);
            bookingBuilder.Property(b => b.Id).ValueGeneratedNever();
            bookingBuilder.Property(b => b.StandardVisitors).IsRequired();
            bookingBuilder.Property(b => b.DiscountVisitors).IsRequired();
            bookingBuilder.Property(b => b.BookingStatus).IsRequired().HasConversion<string>();
            bookingBuilder.Property(b => b.PaymentStatus).IsRequired().HasConversion<string>();
            bookingBuilder.Property(b => b.SeatNumbers).IsRequired().HasColumnType("jsonb");
        });
    }
}
