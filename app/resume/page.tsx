import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Github, Linkedin, Mail, FileText } from "lucide-react"
import Image from "next/image"

export default function ResumePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardContent className="flex flex-col md:flex-row items-center gap-6 pt-6">
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">John Doe</h1>
              <p className="text-xl text-muted-foreground mb-4">Full Stack Developer</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <Button variant="outline" size="sm">
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </Button>
                <Button variant="outline" size="sm">
                  <Linkedin className="mr-2 h-4 w-4" />
                  LinkedIn
                </Button>
                <Button variant="outline" size="sm">
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Download CV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>About Me</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Passionate full stack developer with 5 years of experience in building scalable web applications. 
              Skilled in React, Node.js, and cloud technologies. Committed to writing clean, efficient code and 
              staying up-to-date with the latest industry trends.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Work Experience</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">Senior Full Stack Developer</h3>
                <p className="text-sm text-muted-foreground">TechCorp Inc. | 2020 - Present</p>
                <ul className="list-disc list-inside mt-2">
                  <li>Led development of a high-traffic e-commerce platform</li>
                  <li>Implemented CI/CD pipelines, reducing deployment time by 40%</li>
                  <li>Mentored junior developers and conducted code reviews</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Full Stack Developer</h3>
                <p className="text-sm text-muted-foreground">WebSolutions LLC | 2018 - 2020</p>
                <ul className="list-disc list-inside mt-2">
                  <li>Developed and maintained multiple client websites</li>
                  <li>Optimized database queries, improving application performance by 30%</li>
                  <li>Integrated third-party APIs for enhanced functionality</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Education</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <h3 className="text-lg font-semibold">Bachelor of Science in Computer Science</h3>
              <p className="text-sm text-muted-foreground">University of Technology | 2014 - 2018</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge>JavaScript</Badge>
              <Badge>TypeScript</Badge>
              <Badge>React</Badge>
              <Badge>Node.js</Badge>
              <Badge>Express</Badge>
              <Badge>MongoDB</Badge>
              <Badge>PostgreSQL</Badge>
              <Badge>AWS</Badge>
              <Badge>Docker</Badge>
              <Badge>Git</Badge>
              <Badge>RESTful APIs</Badge>
              <Badge>GraphQL</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">E-commerce Platform</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  A full-featured online store with real-time inventory management
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">React</Badge>
                  <Badge variant="secondary">Node.js</Badge>
                  <Badge variant="secondary">MongoDB</Badge>
                  <Badge variant="secondary">Redux</Badge>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Task Management App</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  A collaborative project management tool with real-time updates
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Vue.js</Badge>
                  <Badge variant="secondary">Express</Badge>
                  <Badge variant="secondary">Socket.io</Badge>
                  <Badge variant="secondary">PostgreSQL</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}