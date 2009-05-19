#!/usr/bin/ruby

require 'fileutils'

levels=[]
level=[]
f = File.open(ARGV[0], "r")
while(line =f.gets)

	line.gsub!(/[^\s#.$*@+]/,'')
	line.gsub!(/\c*/,'')
	line.gsub!(/^\s+$/, '')

	if !/^[\s#.$*@+]/.match(line).nil?
		level.push(line)
	else
		levels.push("\"#{level.join(",")}\"") if level.size > 1
		level = []
	end
end

puts "[#{levels.join(",")}]"
