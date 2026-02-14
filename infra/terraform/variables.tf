variable "project" { type = string  default = "ai-incident-intel" }
variable "location" { type = string default = "canadacentral" }

variable "container_image" {
  type        = string
  description = "Full image name including tag (ACR login server/name:tag)"
}

variable "static_web_repo_url" { type = string }
variable "static_web_branch" { type = string default = "main" }
