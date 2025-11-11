namespace Task_Management.DTOs
{
    public class TaskCreateDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public List<string>? AssignedTo { get; set; }
        public string? Status { get; set; }
        public string? Priority { get; set; }
        public DateTime? DueDate { get; set; }
        public string? CreatedBy { get; set; }
    }

}

