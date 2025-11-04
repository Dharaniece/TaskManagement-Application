using System;
using System.ComponentModel.DataAnnotations;

namespace Task_Management.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(100)]
        public string? Name { get; set; }

        [Required, MaxLength(150)]
        public string? Email { get; set; }

        [Required]
        public string? PasswordHash { get; set; } 

        [Required, MaxLength(20)]
        public string Role { get; set; } = "User";

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    }
}
