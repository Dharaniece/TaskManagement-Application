using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Task_Management.Models
{
    public class TaskItem
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(150)]
        public string? Title { get; set; }

        public string? Description { get; set; }

        [NotMapped]
        public List<string>? AssignedTo { get; set; } = new List<string>();

        // 👇 This property stores the list as a comma-separated string in DB
        public string? AssignedToSerialized
        {
            get => AssignedTo != null ? string.Join(",", AssignedTo) : null;
            set => AssignedTo = !string.IsNullOrEmpty(value)
                ? value.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
                : new List<string>();
        }

        [Required, MaxLength(50)]
        public string Status { get; set; } = "Pending";

        [Required, MaxLength(20)]
        public string Priority { get; set; } = "Medium";

        public DateTime? DueDate { get; set; }

        public string? CreatedBy { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedDate { get; set; }
    }
}
